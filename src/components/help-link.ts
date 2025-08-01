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
import { a, createPreactFactory } from '../utils/preact';
import { getLocale, getTranslation } from '../localization';
import { InitParameters } from '@acrolinx/sidebar-interface';
import { getExternalLinks } from '../utils/externalLinks';

export type OpenWindowFunction = (url: string) => void;

interface HelpLinkProps {
  openWindow: OpenWindowFunction;
  initParameters: InitParameters;
}

function getLocalizedDefaultHelpLink(): string {
  const locale = getLocale();
  return getExternalLinks(locale).helpLinkUrl;
}

class HelpLink extends Component<HelpLinkProps, {}> {
  render() {
    const props = this.props;
    return a({
      className: 'icon-help',
      title: getTranslation().serverSelector.tooltip.openHelp,
      onClick: (event: Event) => {
        event.preventDefault();
        event.stopPropagation(); // Prevent triggering the click event on the containing element.
        props.openWindow(props.initParameters.helpUrl || getLocalizedDefaultHelpLink());
      },
      href: '#',
    });
  }
}

export const helpLink = createPreactFactory(HelpLink as ComponentConstructor<HelpLinkProps | undefined, {}>);
