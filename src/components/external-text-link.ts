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

import { Component, ComponentConstructor } from 'preact';
import { createPreactFactory, a } from '../utils/preact';

export type OpenWindowFunction = (url: string) => void;

interface ExternalTextLinkProps {
  url: string;
  openWindow: OpenWindowFunction;
  text: string;
}

class ExternalTextLink extends Component<ExternalTextLinkProps, {}> {
  render() {
    const props = this.props;
    return a(
      {
        className: 'externalTextLink',
        onClick: (event: Event) => {
          event.preventDefault();
          props.openWindow(props.url);
        },
        href: '#',
      },
      this.props.text,
    );
  }
}

export const externalTextLink = createPreactFactory(
  ExternalTextLink as ComponentConstructor<ExternalTextLinkProps | undefined, {}>,
);
