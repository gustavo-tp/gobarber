import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useAuth } from '../../hooks/auth';
import api from '../../services/api';

import {
  Header,
  BackButton,
  HeaderTitle,
  UserAvatar,
  Content,
  ProvidersListContainer,
  ProvidersList,
  ProviderContainer,
  ProviderAvatar,
  ProviderName,
  Calendar,
  Title,
  OpenDatePickerButton,
  OpenDatePickerButtonText,
  Schedule,
  Section,
  SectionTitle,
  SectionContent,
  Hour,
  HourText,
  CreateAppointmentButton,
  CreateAppointmentButtonText,
} from './styles';

interface RouteParams {
  providerId: string;
}

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}

interface AvailabilityItem {
  hour: number;
  available: boolean;
}

const CreateAppointment: React.FC = () => {
  const { user } = useAuth();
  const route = useRoute();
  const { goBack, navigate } = useNavigation();

  const routeParams = route.params as RouteParams;

  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(0);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState(
    routeParams.providerId,
  );

  useEffect(() => {
    // api.get('providers').then(response => setProviders(response.data));
    setProviders([
      {
        id: '1fb66677-0cfd-4e5e-af83-a26e6bc7d346',
        name: 'Gustavo 4',
        avatar_url:
          'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUSExIVFRUVFxUVFRUVFRcVFRUWFRUXFxUXFRYYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGi0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKy0tLS0tK//AABEIAKgBLAMBIgACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAFBgMEAAIHAQj/xAA/EAABAwIEAwYEBAQDCQEAAAABAAIRAwQFEiExBkFRImFxgZGhEzKx4ULB0fAHI3LxFGKCFTNDUoOSk6KzJP/EABkBAAMBAQEAAAAAAAAAAAAAAAIDBAEABf/EACsRAAICAgEDAgYBBQAAAAAAAAABAhEDMSEEEkETIiMyUWFxwYEFQqGx0f/aAAwDAQACEQMRAD8A569yrVHLeoVA8oloS9mjioytytHLjkarYLxewuNMK9aF5C3p7rjC5TGiq1TqrfJVHDVaLjs1XpKxy1XBngUrAtWtW4XHMnptkx10VO4qy+CIYOpiY/Fpr7q4HZRqAcw01IidPXuVKralx7LQJ2iZ7hBQcydIbCKirZtRphxgAE6EEu08+5bEycpbBJ1c32gbRsp7bCXgiQR1J/OVedZ1m/KJgaCAY/TSRHemLp51dG+vC6bANnSl0k6cyd/3yWxrDPHZI2BcCY8pGqJXFo8AlzTJgR3Cfsh7cOeQTsN90csckqoBTV3ZWqv1/wB23ymHDzPZPgq43nT6qzUp98dyh+GddPE9Enta2MtM8rPDjJBk+AHsAoyyNQZ/LxWPB6rWVhpNTr8neBMTp+a2FOdoMeqg+J1U1CsWyN2mJXHElvXLCA7ZGKTgRIQWoyNDsdj0Kls7gtdB2XWBOHchitmqWuNF5akEAhZdFOWiD+4qNdqrQKpDdW6SW9hSResd0Sc7RDrUK05yNIWlbN6YkprwKnmcEt2dKSnjhS07QRFCR0PCaWVgV1R0Ww0BSJL2VR0fIj1A4KxVVZ7lolGrnKNer0BcFo9aFuVpK2FMlaYeAK3Qtydgr/DGCOuHxGg3XSW8MsYzUQjjj7jpSUUctcwjkq7gn3EsLZ3IHVwXNsmvp3XAtZYiu9e02qzfWbqZgqWrhdZjc5YSz/nZD2jxLdvNIppjHoqkL2m4DUqKZR3hnBf8XXp0QND2qhjZjeQPfoPNY7fCOivLCHBfDZuj8Z85ROWeZGhPgCm3C+HKTXO7IJGgJA315JpsbRtFrmgQAMoAVTCqgJcDvvr+vXRehiioR4I883KQKtcJYak5Rv06bL27woAns78h0TFQblMkR0nePGNefooMTeQYglp15b7H6Jne7FqHAj3WFAkaHmR68lTxXCGtaGtAk6nfRN1RgLs5Mzu7qY1jrr6qhVo9ol41B2OgPlv19l12boR6uAwMx9EFuLWTAGieMVvNSB5xyQB9Gdh5oJQTGwmxWrW4109FSrUcqcxat3gT3oRitAfh81LPD5KIZfAuOKnsyNQTyMdOX3WlWnB2WU2aypWUlmk/MC2OQ07x9lDnGxU2fKZ68/D+6rXI+qw4ZMBraFh5fQq3cJewe5hwHOd+7oUw3ITIMkzRqV/UqjdXKKotOqu0AuexcghRCmAlR0gr1rRlHEGAZ4fs87hounYFhmUTCB8F4ToCQn2mwAQslKinHG+T0BerFiUPPlK+ttJCDvTLOZqA3tOHKjLGnZPErLJXoatXJQZ44ps4Vw4VglJoTfwNefDqBp2J0XGo63wtw2yiwGBO581Q4ovg2QEUu8ayUS7oFzm8vX13E6wn4tisuije35JVnBroF0HmhF8wtmVWw68h4VTlXAlKwzxfaty5gtsMwx7qDK9F7mucNcp5gwQRsdjupMUd8WmjHAbgKFSi4/I+R3B4/UFS5Y2WYJUxdv8AAxXY6plFOtTj4gaIZUB2eG/hOmsd3VOP8JcMDKLq5Hae4sH9FMQI/wBRcpxRGciPma5vkRI9wESwqLezos20zEDaXdo+7isxxtozP2wutFi7r/zC3l+ao0qJY/OBpr76eYVqrR+JrziSO7Qz7ra1plkB+o6n6K1UkeZTk7LkaAjaCCOo1g/vogmM3faDR5+aM/CiY2O0HQa+EoDUtsziepif7oI7GtcGtatoAGkDXNymIgB28IVitzuGgEnpvG/1PsmOtb9gt0noR3amduQ07kCvKbQNJLvCQN59/qiVAULNS21JPoqleuG+PRF7+ze7WSB0J1QetYxuVrCQPuLqdAqRpE8kTfSaNlA55OgCTIdEDXtmANfJB3mNEy3NuSDKXrtkFS5YlGNmx1jpp5afZQVSSJVkuHw4G+i0oUwQATEmD4BJHFegTmGXU8gNfZNrq7Q0Z3Bpjbd3oED+Ll7NMZZ3P4j59FbsbSVzl2mxwerwywyq0nTMe/LA+qJWoW9pYhoLnbAErbDaZe4ADUrotvliOrxRx0kELekSmDAbAveBGintMEcGpw4PwoTJHemuaSEQixpwWz+GwIkvAF6lt2VpUjFixYsNPlyjsUKxHdELWroh2IO7SqysmiVHlRFbStmtSLGGU2opZVsj2O6EKhTGq9uHwhs6Ozs9m9tWjHUKOzwtrGmUq8K4oRTDZRi9xUhhVKVciW74APElMFxhLzKHa0Vi+xIucSqwr6SmOpHRuJdrYjkbC0wTiP4NYPP+7d2ag/yHc+I3S7f3GYwvaTdEiU7Y5KlZ3Btu4PDQQcrvRo594hV8axKtMMp/y26NEcvFTWWJU20ad086G3Y4ncA5QCD35gfdKV1xy1xIkNaZhzg4z39lpj9+TsUox5YGdPJSQwWHEmRwD2FsnpsYEfRMjb9lTTmduYd3z1XNKeMtcdSxzTpnYczd+fMFNuBXUANn5SC1w+YDUwNepCe6lyiSnHhjDQq9nL0/IeGiH0AXOAHUkoiANXaQRtuBpB8tdEMpuLQXaaDQcwTOvlHuhCsnuGh5IBhjT5nxVSrUpMnw06d5J/JUsRuSynA+ZwmZkDqP6vokzGr8xka49Se/oAe+VvCQPLYdvcSplxAIy9rU9mZ0G3PWd+SEXVxRGmYOPNK9Rmbd581vSsGn/iIfU+gfpVsNVajD8pB8FRcTMAKhVtXN1BlFeH6ud2R3PYrHL6hqJXrWzuZSviFOHQui8R2nwwdNxp7Lnt9uSkT0PhwV2t7OngfZb27N+s+3NZbGGz4fWfyXtmJk9/1/spShE9CjJR+wblEeyF24MwiXxGs7M9ogkeW5Xdt7HLJ2Kze/uzHwwf6v0RbhBwFYZunulqlqUx8PUCagha9Hm5ZuTtnWrCmCEycP0IBQrhzDTlBITTRpBogIVyNgiRYsWIhpixYsXHHyYx8BUK75Knqv0VUps5WxCRoFMFEt0BrJKbtVXvXqakFWu0IyKpDDwncEwEbxuvDYlA+DaUlE+JaRCqXy8krdTF+oormpAUlvuo8VGi18IYuWCw6SiNBuiGUt0VobKdDJ6HrCaT6uG5MzcrTVBzQMoL6RY3MdpLneqNYdw7Tom1eKTXupspvqg/jqmahzEbwXNHg0BVv4ZWXxLa8cToXUqLRyaQ1z3u06io3yCvW2KPt3ZKrTUaNnCASOWYGAfEEeaDNhyZIewbiyQhxITKWE3l5iNZ9S3dRY8lzuyQxvZAaKZIGYSBtynnCbeGaD2F1KqCKlJ2U9CIkR3HUg9ERdx9SB0oHN4geoCrYC+tUr1q1XIc72FuQggNDHCDPPuI5pnR+sp1NUqE9UoPHafI3UHQwiB9iNdUJfVDQZAI1MGN+W/eizh/LJAgDl3H5ZiJOu6VsUuA3QgmSNBo46xAOu+vI7K0j8AfGrsBp7JEmWSeyG6zE76ga9xSBil5rpuUxYxcabgkxBEgDTUEEbj0SXdPkmPAJeWVIdhhbL9jh9SpTq1Wta5tFueo6odAOjGfiMrfDrV9dpdS+G6CQRlNMjSR9NPBMmGYDTubcAbObsNHNI5jp5pk4Z4WpWdMuJmSC4vIOboIHLU+q8ifWSSdbPSXTq/scxdXqU3mnUaWkcnfrzCJYSf5jXDkQYV7i5zKridAc0jrHIATz1QfDHOY4HkrcM5SjckT5ccYvg6Jxoxv8AhS8dGx5/29lxy6M6rr3EcGxeY0AZ5HSAuSXERrzIA9ZP0jzTJ6AS5NHEACNt/ZT2AGUDqZP5KtW7IAO8ff8AMKQXHw2jLuefMRzHfqkDQg69bTOvoN/soMPql9V7z/yu8BpAAQjvRPCBq4zyiPE/ZczHoIW+6feBKIdUBOwSHbCSulcF2LwQ6Fk9EslbOyYa0BghXFUw75QFbWQ0UrRixRXFy1glxAQt3EtuPxj1C2zQysQWnxPbkwHj1CIU8QpuEh4XWcfKeJUsuiHkopjTu0hcJstiFo8WwCt2mGvfs0ovQwAxJWrHJmOaTAewVKq0nkmupg6nscGBOoRxwPybLMkecF2xaJKu8SVAdEVo2opM0QC/7biZTUuKJ3blYFt2arXFaHZVir2StqhzCFrVqhi3YrsbqidEwJXtexIK0q0zlI5lTTi4csfH4jSR1n+FVQCyqtG7q5J/8bI+iZbzC6dTVzZzSI1BAmY079YXPP4Y3pNtVYCQQ6m7SNjmafH5B6hdAsL4OaNdtNd1Rg5x2d1UVHLX2X+kUHYRSbGRjQ4c4kzzkgfuVLZMDSQBzJMdzfuVduqmUSNI2119kLsmyST1P1H6KiKIMj8Bu5qAUJ66+B/f1SDjV0STBPSJ2A7vM+pTnjlcikAOY18tB48lzvFDqSYnfxP71QhgK/fM9dgqFtaEOnlzPRS16mo79USsth3baayk0pMcm0T07GsPlc4SYIc4tggSfBVbg13aE1OmXM4iPVH7FnZE9435j6bhb1tuQjTTc/fXkteNM5SYrsw4jVwidRMiZ596sW9Alwb1MDxUt/eNHPUKfhOh8auO7X0QtKOg423yMPGwFPDY5ksHnMnn3ey5Fkktbz3PmR+i6j/F+8Ap0KA6l2nQaD6+y5hcObmeR3NHkAPy91PN8Dlsq3L8zp7/AM/0hb3I+UdyhZ8w8lPeO7Q/pCUEVx+aJ4SzR57h7n7Ia0aIvhY7DoOhI06brTHoKYNSmo2eq71wtYjI3TouIYHT7bZXdeEq/Zagm+RMdjdTZAVO+xJrAddVeSZxTRc1wM6I4x7nQyT7VYp8W4jcVnENcQ3uSTVtKwO59Suhvg8kMxENA2V0cMaom9aQlGjUG0q9aYxcMblD3R5q4+s2Vet7UFsgaJObAloOGWznWJul5R7g/hz45zuGnJA7mnmqx1K6pwuG0qY7ghiubMbpFpuCMpjYKjeW2mgRtlb4p0W1eygaqmEhMkK9tZydVPWtAzUK5XqNaqgcXlM2L/JRunEiEHq4e7eE2G27llagA1Z2oJSZz59mZ1UoowjN3Q1WlK3COEVRspAc2x6KjibMjC7uP6fmm8WvclTi90S3uj6fm4ein61r06+rX/Sz+nv4jm/Cb/nS/wAsi4BxX4VQMJ0fNM+J7TT6tI/1LobLotII2XEaTiCCDBBBB6Eagrr9q89nMIzNa7L0zNB/NB0kquP8mdY3KpfRJDA+9L2wfXz5Dnv7LWxuWgZZgjf9VXtKUnTYLTFrLPBBII2IVjvwQJru9xfx2/pgAZxoOoSNil9TJ3nzVHGbmsx7mOBMbGNCgTmVXGXGO4KX1nqiz0ormzfEamZwhFbGsYk+HIenoh1C2jXdWmOy+42B3Ec10W7tgy1wExiWX8vuqVzijiqb3KvUqInM5RN3uJOqeuA2Npuzc4+v00BSBaPzPCYv9r/BaS2M0QEluxq4KvHmJ/Gvyd20WwP9ALj6nRJR0EeBV+5qkte92pqODR1gHM4+zQhzj7JM9jEe27u1Pp4re5PaK1smmdN15W+Z3iR7oQjG7Jh4bo5muhusg+WsfmgA+XzTjwNT3Oh28o/usMegjhtofiCBqut8N0y0CZS3glm2cwAT5bUQAIQSfIpR5sP0qoISnxhiDANSr2I13NbouY8RXFSpU7pTsN3Z2TVBqhcNIlDcYrCCtKFMtZMpUxXETmIC9G0uSNW+Daq+XaJvwWzcaQOu5SFb1DmE9Qu3cM0G/wCHZokZsqrgZGDTOC2YmtPem29xPJS0KVLATVMJgu8Le9oCGGjZbDvAOLh5OY7I9xVjjabdCJKQLP8A/KNNOqFX14+4qSTIRFeLGkrYet751V0zomWxpwEp4U3JEpysagITo8Iiyq5WWBCr3LhClq1AEGxK+0MLrFqLegXiFwA5b21QFL2JXJzKa0ujC6EqdMpng9tjXTqtXPOL35q1SNQHMb5nUj1BRqpiRmJS/WMkE7Fz6njl0n2KR1TTpBdMmrAOUSZ5B30XZ6FQVWU3SM3wmOI7iIB/9T6LjDjue6PU/ddAscQ+HeW9KdH2tJv+oZ3D6uHmFBGVdRB/n9FmSKlin/H7H7DnAMJJGvXRVbrFGknIARJ1JgeSgNmK/wDLL3MEEktMHUab98Ide8HUyOxdVWxyJaR9F6eSUlo87DjjLZWxG+Y53ygnudp7oLeET8se4UlxwjXb8lUOjmdD9UMvMLuqf4mnukz9Ej1JfQp9GPg3Llq9yFuNUH5R4AqZlV34hC1TFuFEld6o1CSrNVygcVkmcjei/KNFDdXBI1WrnRuqNWrJQtho2q1JIHJu3idSoKm3iVjBpK8uOQ6JL2M8E9iNdPPwUFQ795P1VuzOhPQE+xj3hU1xpLGg/f72TrwHRkEDQmT6ZUlHknzgOoGb75Tr3Ej7IWc9D3gAcJE7J0wy4kjVL/D9IOBTRY4YQJQMWkSYs4FpXOb8DOT3p9xSQ0yud46/tCFX0sqdC88biVcUxENYQDySrSZmMlWsVaSqTH5VY2nwTpNII2dn8SqxjRuRr0HNdsw5gZTawbAALl3B1kSfiu8k9MuzGiizVdIbBtnIuGbfNVJ70+Vq7KbOUpX4VoQ3N1XmP3cmAU1cI6Kt8g3GLxr6mUea9tmgbIWKXalFKNVoaiT7VZTCfd7Fo1qXnagIzh984BKo1qabJhtnQzVd3e2wvQUpUtBylUc8ILf1gxxBKJYfdADdJ/ENwXPIC5zozCoxbJsSh+oW1rbnJKp4Y2SASmU0gKZ8ExPudi88qXAoF/8AM8AT7fdQYpUjQaZWin5bu8yQfVEaNAF7mkgB0yTtlYC93noB5oDi1xLy2Z3M+IUOV+9obiXtTB3VF+Jbhzbim5pgspUC09CGNcD6lBw3Qn96yr/EDpqNPWjb/wDxYkNfEi/s/wBDE/hy/K/Z1TBr/wCPRbWZu4QR0cNCPVDMWubljuw3MOh8ktfw5xr4Vb4Lj2Kp07qg29dvGF1QUm7mPPX1lepBrJE8+ScJcCD/ALaumTnonXvQq8xl7jq0jxXRsVoNdyHoOf790lYtQbMBu2566oJY/uHHIwF/iSe5eOepX0gFBUICXVBbInPUb6sKOrVVR75QNhJG1atKhctgFq8aIWESUBIHp67KCs6XK03RsqmEAYVw2iHCDMHpvHVDniNO8oxhdM7iZA5bjpMoP+pQp8sNr2pkhGqeuFCA0zyYIPi4/ofRIoGo1T/w9aucAOuVp8pj2WsW9M6FwnfagLqNoRlC5rheDFrQW6QnrA63ZyncJfkCNkHEdtmAA/EdULr8OMLNW8ky3rhInkql/ftbTJnkti6fA3t45OJcV2QpVHNB70quOuqZeJ7k1a9R3KYHgEq3LDK9KnRDdsZbDiT4TMo8l0TAquei1x3K4xYUZcF1zCamWkwdwUeZUPxIULa4FOl5JRvb4uqeJVvE77s5Qh2FUc9QKmX0Ex4Vhu3wxzmyq93hr29U/YbbAMGiq4zSbGyxrmjISrkTKdvkElVn4gYhGMQOkBDqVhOq1pvgohm7Yk2G35AMqliLwSSF7Vp5VSquK2SdC8cubJbGtlKI1MTMQgbSp8ui2LdGT5CNvVy0ar82XM0MPZmQ9xLhPKBTHjmSZWdLiZnfVM2K18tBrJIdLi4chADWx4gEn7JXfuoNybLflikSEfyx/UfYD9VPiFFznZgJDadEE/8ASYta7OwyOZMe32RAN/l1CRPaDQc22VoGyybrk2Cu0A2OIMjQjUEbg9Quh4Zxj8SmA/So0DN3/wCYLnaPcI0ZqPMTDQPU/ZU4JNSpeSXKl22xqrcQyN4QW8xKUarYLRcAckHnlJHsDCG18BYDpm8CVTkUxEJxA9W6VSpVJ5I0/DWjYR++qp16EKdpjVJApzDzWCmVcLFo4IKDsrlqr1SrVVVHhczUSVdG+KgpDX0U9z8o8votbRkuHqljGEqFcMBkkTzHUIWNvNX7uqAMoaDmG/Tw0VBuyFLmwm+EiZrJcB1XT+Enhun+f6DX3lc2tgczI5fquj8I0Za479qZ8ZP5o4w7pULm6i2desK7cnkqlxjbaXNK1TEXNEApcxvEXOB1VK6VLYj1r0MeNcc65QdShN7xLUrDLMBImpdKYsNpaLcWGN2ZlyuqNq9PRCLi31TLVpaIde28BUtE0WD8JYMxTgMXa0ATsEiscWulaV7wypcmO2UQlQNqEuKJ4EAKgWLF3k2Wjo9CrDEMxBxcsWJi2TIpU7MO3W91RDWwvFiLybYuXQ1VJ7Fixaw0yIsW0yQOpAXqxA9DEVcbMOyb7EnvOseWaPJBNp5/h+6xYoEWPZcuPwDk1xH/AGhsrylVDqVTTUHMXZo+Y6ADn9lixZJWFB0DU48EMaCdR/Ma0D+ps5h3HULFifhdZEIyK8cvwOtSjrooqtpOsLFi9CWjzY7BN7SgbIFdMWLFNMoiD3U146joP3zXixLocVqzVUj1WLEqYyBlyIa3yPqFvZN1J5AALFiWM8mtcnOe5RU9isWLTgjaD5D3OM+AlPnBFz2HNO0NIPiCD9FixMw/OgMvyMPXb9ECuKBdKxYvRfJCnRToWXa2TNY2ohYsWpUhcnbLD7fVU8TpCFixaYLVxbIXVo6rFiXkXA/Gz//Z',
      },
      {
        id: '5fc6e5ff-412c-4869-8ecd-01b6a8d50b8a',
        name: 'Gustavo 3',
        avatar_url:
          'data:image/jpeg;base64,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',
      },
      {
        id: '2bc42559-b69c-4310-9f4c-553419634c45',
        name: 'Gustavo 2',
        avatar_url:
          'data:image/jpeg;base64,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',
      },
    ]);
  }, []);

  useEffect(() => {
    api
      .get(`providers/${selectedProvider}/day-availability`, {
        params: {
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth() + 1,
          day: selectedDate.getDate(),
        },
      })
      .then(response => setAvailability(response.data));
  }, [selectedDate, selectedProvider]);

  const navigateBack = useCallback(() => {
    goBack();
  }, [goBack]);

  const handleSelectProvider = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
  }, []);

  const handleToggleDatePicker = useCallback(() => {
    setShowDatePicker(state => !state);
  }, []);

  const handleDateChanged = useCallback(
    (event: any, date: Date | undefined) => {
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }

      if (date) {
        setSelectedDate(date);
      }
    },
    [],
  );

  const handleSelectHour = useCallback((hour: number) => {
    setSelectedHour(hour);
  }, []);

  const handleCreateAppointment = useCallback(async () => {
    try {
      const date = new Date(selectedDate);

      date.setHours(selectedHour);
      date.setMinutes(0);

      await api.post('appointments', {
        provider_id: selectedProvider,
        date,
      });

      navigate('AppointmentCreated', { date: date.getTime() });
    } catch (error) {
      Alert.alert(
        'Erro ao criar agendamento',
        'Ocorreu um erro ao tentar criar o agendamento, tente novamente',
      );
    }
  }, [navigate, selectedDate, selectedHour, selectedProvider]);

  const morningAvailability = useMemo(
    () =>
      availability
        .filter(({ hour }) => hour < 12)
        .map(({ hour, available }) => ({
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        })),
    [availability],
  );

  const afternoonAvailability = useMemo(
    () =>
      availability
        .filter(({ hour }) => hour >= 12)
        .map(({ hour, available }) => ({
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        })),
    [availability],
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled
    >
      <Header>
        <BackButton onPress={navigateBack}>
          <Icon name="chevron-left" size={24} color="#999591" />
        </BackButton>

        <HeaderTitle>Cabeleireiros</HeaderTitle>

        <UserAvatar source={{ uri: user.avatar_url }} />
      </Header>

      <Content>
        <ProvidersListContainer>
          <ProvidersList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={providers}
            keyExtractor={provider => provider.id}
            renderItem={({ item: provider }) => (
              <ProviderContainer
                onPress={() => handleSelectProvider(provider.id)}
                selected={provider.id === selectedProvider}
              >
                <ProviderAvatar source={{ uri: provider.avatar_url }} />
                <ProviderName selected={provider.id === selectedProvider}>
                  {provider.name}
                </ProviderName>
              </ProviderContainer>
            )}
          />
        </ProvidersListContainer>

        <Calendar>
          <Title>Escolha a data</Title>

          <OpenDatePickerButton onPress={handleToggleDatePicker}>
            <OpenDatePickerButtonText>
              Selecionar outra data
            </OpenDatePickerButtonText>
          </OpenDatePickerButton>

          {showDatePicker && (
            <DateTimePicker
              mode="date"
              display="calendar"
              onChange={handleDateChanged}
              textColor="#f4ede8"
              value={selectedDate}
            />
          )}
        </Calendar>

        <Schedule>
          <Title>Escolha o horário</Title>

          <Section>
            <SectionTitle>Manhã</SectionTitle>

            <SectionContent>
              {morningAvailability.map(({ hourFormatted, hour, available }) => (
                <Hour
                  enabled={available}
                  selected={selectedHour === hour}
                  available={available}
                  key={hourFormatted}
                  onPress={() => handleSelectHour(hour)}
                >
                  <HourText selected={selectedHour === hour}>
                    {hourFormatted}
                  </HourText>
                </Hour>
              ))}
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Tarde</SectionTitle>

            <SectionContent>
              {afternoonAvailability.map(
                ({ hourFormatted, hour, available }) => (
                  <Hour
                    enabled={available}
                    selected={selectedHour === hour}
                    available={available}
                    key={hourFormatted}
                    onPress={() => handleSelectHour(hour)}
                  >
                    <HourText selected={selectedHour === hour}>
                      {hourFormatted}
                    </HourText>
                  </Hour>
                ),
              )}
            </SectionContent>
          </Section>
        </Schedule>

        <CreateAppointmentButton onPress={handleCreateAppointment}>
          <CreateAppointmentButtonText>Agendar</CreateAppointmentButtonText>
        </CreateAppointmentButton>
      </Content>
    </KeyboardAvoidingView>
  );
};

export default CreateAppointment;
