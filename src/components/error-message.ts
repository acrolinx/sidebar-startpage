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
import {button, classNames, createPreactFactory, div} from '../utils/preact';
import {getTranslation} from '../localization';

interface HtmlWrapper {
  html: string;
}

export interface ErrorMessageProps {
  messageHtml: HtmlWrapper;
  detailedMessage?: string;
}

interface ErrorMessageState {
  showDetails: boolean;
}


class ErrorMessageComponent extends Component<ErrorMessageProps, ErrorMessageState> {
  state = {
    showDetails: false
  };

  toggleErrorDetails = (event: MouseEvent) => {
    event.preventDefault();
    this.setState({
      showDetails: !this.state.showDetails
    });
  }

  selectDetailMessage = (event: Event) => {
    event.preventDefault();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(<Node>event.target!);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  render() {
    const props = this.props;
    return div({className: classNames('errorMessage', {hasDetailsSection: !!this.props.detailedMessage})},
      div({className: 'errorMessageMain', dangerouslySetInnerHTML: {__html: props.messageHtml.html}}),
      this.props.detailedMessage ? div({
          className: 'detailedErrorSection'
        },
        button({className: 'detailsButton', onClick: this.toggleErrorDetails},
          getTranslation().serverSelector.button.details),
        this.state.showDetails ? div({
          className: 'detailedErrorMessage',
          onClick: this.selectDetailMessage,
        }, this.props.detailedMessage) : []) : []);
  }
}

export const errorMessageComponent = createPreactFactory(ErrorMessageComponent as ComponentConstructor<ErrorMessageProps | undefined, ErrorMessageState>);
