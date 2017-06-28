import {Component} from 'preact';
import {createPreactFactory, h1, div, button, form, input, span, a} from "../utils/preact";
import {getTranslation} from "../localization";
import {isHttpsRequired} from "../utils/utils";
import {externalTextLink, OpenWindowFunction} from "./external-text-link";

interface SeverSelectorFormProps {
  onSubmit: (serverAddress: string) => void;
  onAboutLink: Function;
  serverAddress: string | null;
  enforceHTTPS?: boolean;
  isConnectButtonDisabled: boolean;
  openWindow: OpenWindowFunction;
}

const SERVER_ADDRESS_INPUT_FIELD_CLASS = 'serverAddress';

class SeverSelectorFormComponent extends Component<SeverSelectorFormProps, {}> {
  serverAddressField: HTMLInputElement;

  onSubmit = (event: Event) => {
    event.preventDefault();
    this.props.onSubmit(this.serverAddressField.value);
  }

  onClickHeader = () => {
    this.props.openWindow('https://www.acrolinx.com/');
  }

  render() {
    const t = getTranslation().serverSelector;
    const props = this.props;
    const httpsRequired = isHttpsRequired({enforceHTTPS: props.enforceHTTPS, windowLocation: window.location});
    return form({onSubmit: this.onSubmit},
      div({
        className: 'loginHeader',
        title: t.tooltip.headerLogo,
        onClick: this.onClickHeader,
      }),
      div({className: 'formContent'},
        h1({
            className: 'serverAddressTitle',
            title: httpsRequired ? t.tooltip.httpsRequired : ''
          }, t.title.serverAddress,
          httpsRequired ? span({className: 'httpsRequiredIcon'}) : []
        ),
        input({
          className: SERVER_ADDRESS_INPUT_FIELD_CLASS,
          placeholder: t.placeHolder.serverAddress, autofocus: true,
          ref: (inputEl: HTMLInputElement) => {
            this.serverAddressField = inputEl;
          },
          defaultValue: props.serverAddress,
          spellCheck: "false"
        }),
        div({className: 'buttonGroup'},
          externalTextLink({
            url: 'https://blog.fefe.de',
            openWindow: props.openWindow,
            text: "Can't connect?"
          }),
          button({
            type: 'submit',
            className: "submitButton",
            disabled: props.isConnectButtonDisabled
          }, t.button.connect)
        ),
        a({onClick: props.onAboutLink, href: '#'}, 'About Acrolinx')
      ));
  }
}

export const severSelectorFormComponent = createPreactFactory(SeverSelectorFormComponent);

export function focusAddressInputField(el: HTMLElement) {
  const addressFieldElement = el.getElementsByClassName(SERVER_ADDRESS_INPUT_FIELD_CLASS).item(0) as HTMLElement;
  if (addressFieldElement) {
    addressFieldElement.focus();
  }
}