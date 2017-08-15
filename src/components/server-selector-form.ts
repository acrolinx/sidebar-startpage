import {Component} from 'preact';
import {createPreactFactory, h1, div, button, form, input, span, a} from "../utils/preact";
import {getTranslation} from "../localization";
import {isHttpsRequired} from "../utils/utils";
import {externalTextLink, OpenWindowFunction} from "./external-text-link";
import {errorMessageComponent, ErrorMessageProps} from "./error-message";
import {helpLink} from "./help-link";
import {InitParameters} from "../acrolinx-sidebar-integration/acrolinx-libs/plugin-interfaces";

interface SeverSelectorFormProps {
  onSubmit: (serverAddress: string) => void;
  onAboutLink: Function;
  serverAddress: string | null;
  enforceHTTPS?: boolean;
  isConnectButtonDisabled: boolean;
  openWindow: OpenWindowFunction;
  errorMessage?: ErrorMessageProps;
  initParameters: InitParameters;
}

const SERVER_ADDRESS_INPUT_FIELD_CLASS = 'serverAddress';
const CANT_CONNECT_HELP_LINK_URL = 'https://support.acrolinx.com/hc/en-us/articles/115004045529';

class SeverSelectorFormComponent extends Component<SeverSelectorFormProps, {}> {
  serverAddressField: HTMLInputElement;

  onSubmit = (event: Event) => {
    event.preventDefault();
    this.props.onSubmit(this.serverAddressField.value);
  }

  render() {
    const t = getTranslation().serverSelector;
    const props = this.props;
    const httpsRequired = isHttpsRequired({enforceHTTPS: props.enforceHTTPS, windowLocation: window.location});
    return form({className: 'serverSelectorFormComponent', onSubmit: this.onSubmit},
      div({
        className: 'logoHeader'
      }, helpLink(props)),
      div({className: 'formContent'},
        div({className: 'paddedFormContent'},
          h1({
              className: 'serverAddressTitle',
              title: httpsRequired ? t.tooltip.httpsRequired : ''
            }, t.title.serverAddress,
            httpsRequired ? span({className: 'httpsRequiredIcon'}) : []
          ),
          input({
            className: SERVER_ADDRESS_INPUT_FIELD_CLASS,
            name: 'acrolinxServerAddress',
            placeholder: t.placeHolder.serverAddress, autofocus: true,
            ref: (inputEl: HTMLInputElement) => {
              this.serverAddressField = inputEl;
            },
            defaultValue: props.serverAddress,
            spellCheck: "false"
          }),
          div({className: 'buttonGroup'},
            externalTextLink({
              url: CANT_CONNECT_HELP_LINK_URL,
              openWindow: props.openWindow,
              text: t.links.cantConnect
            }),
            button({
              type: 'submit',
              className: "submitButton",
              disabled: props.isConnectButtonDisabled
            }, t.button.connect)
          ),
          a({onClick: props.onAboutLink, href: '#'}, t.links.about),
        ),
        props.errorMessage ? errorMessageComponent(props.errorMessage) : []
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