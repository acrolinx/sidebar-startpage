/*
 * Copyright 2017-present Acrolinx GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Component, ComponentConstructor} from 'preact';
import {createPreactFactory, h1, div, button, form, input, span, a} from "../utils/preact";
import {getLocale, getTranslation} from "../localization";
import {isHttpsRequired} from "../utils/utils";
import {externalTextLink, OpenWindowFunction} from "./external-text-link";
import {errorMessageComponent, ErrorMessageProps} from "./error-message";
import {helpLink} from "./help-link";
import {InitParameters} from "@acrolinx/sidebar-interface";

interface SeverSelectorFormProps {
  onSubmit: (serverAddress: string) => void;
  onAboutLink: () => void;
  serverAddress: string | null;
  enforceHTTPS?: boolean;
  isConnectButtonDisabled: boolean;
  openWindow: OpenWindowFunction;
  errorMessage?: ErrorMessageProps;
  initParameters: InitParameters;
}

const SERVER_ADDRESS_INPUT_FIELD_CLASS = 'serverAddress';

export function getLocalizedCantConnectHelpLink(): string {
  return (getLocale() === 'de') ? CANT_CONNECT_HELP_LINK_URLS.de : CANT_CONNECT_HELP_LINK_URLS.en;
}

export const CANT_CONNECT_HELP_LINK_URLS = {
  en: 'https://docs.acrolinx.com/coreplatform/latest/en/the-sidebar/connect-your-sidebar-to-acrolinx',
  de: 'https://docs.acrolinx.com/coreplatform/latest/de/the-sidebar/connect-your-sidebar-to-acrolinx'
};


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
              url: getLocalizedCantConnectHelpLink(),
              openWindow: props.openWindow,
              text: t.links.cantConnect
            }),
            button({
              type: 'submit',
              className: "submitButton",
              disabled: props.isConnectButtonDisabled
            }, t.button.connect)
          ),
          a({
              onClick: (event: Event) => {
                event.preventDefault();
                props.onAboutLink();
              },
              href: '#'
            },
            t.links.about
          ),
        ),
        props.errorMessage ? errorMessageComponent(props.errorMessage) : []
      ));
  }
}

export const severSelectorFormComponent = createPreactFactory(SeverSelectorFormComponent as ComponentConstructor<SeverSelectorFormProps | undefined, {}>);

export function focusAddressInputField(el: HTMLElement) {
  const addressFieldElement = el.getElementsByClassName(SERVER_ADDRESS_INPUT_FIELD_CLASS).item(0) as HTMLElement;
  if (addressFieldElement) {
    addressFieldElement.focus();
  }
}
