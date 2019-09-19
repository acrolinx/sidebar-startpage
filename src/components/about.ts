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

import {Component} from "preact";
import {forceRedrawInWebkit} from '../utils/hacks';
import {button, classNames, createPreactFactory, div, h1, span} from "../utils/preact";
import {getTranslation} from "../localization";
import {
  InitParameters,
  SoftwareComponent,
  SoftwareComponentCategory
} from "@acrolinx/sidebar-interface";
import {getCorsOrigin, sortBy} from "../utils/utils";
import {OpenWindowFunction} from "./external-text-link";
import {helpLink} from "./help-link";

interface AboutProps {
  onBack: Function;
  openLogFile: Function;
  clientComponents: SoftwareComponent[];
  logFileLocation?: string;
  openWindow: OpenWindowFunction;
  initParameters: InitParameters;
}

function aboutInfoLine(component: SoftwareComponent) {
  return div({className: 'about-item', key: component.id},
    div({className: 'about-tab-label'}, component.name),
    div({className: 'about-tab-value', title: component.version}, component.version));
}

const sortKeyByCategory = {
  [SoftwareComponentCategory.MAIN]: '1',
  [SoftwareComponentCategory.DEFAULT]: '2',
  [SoftwareComponentCategory.DETAIL]: '3',
};

function getSortKey(softwareComponent: SoftwareComponent) {
  const prefix = sortKeyByCategory[softwareComponent.category || 'DEFAULT'];
  return prefix + softwareComponent.name.toLowerCase();
}


function getAdditionalComponents(logFileLocation: string | undefined): SoftwareComponent[] {
  const t = getTranslation().serverSelector;
  const additionalComponents = [
    {
      id: 'com.acrolinx.userAgent',
      name: t.aboutItems.browserInformation,
      version: navigator.userAgent,
      category: SoftwareComponentCategory.DEFAULT
    },
    {
      id: "com.acrolinx.startPageCorsOrigin",
      name: t.aboutItems.startPageCorsOrigin,
      version: getCorsOrigin(),
      category: SoftwareComponentCategory.DEFAULT
    }
  ];

  if (logFileLocation) {
    additionalComponents.push({
      id: "com.acrolinx.logFileLocation",
      name: t.aboutItems.logFileLocation,
      version: logFileLocation,
      category: SoftwareComponentCategory.DEFAULT
    });
  }

  return additionalComponents;
}


class AboutComponent extends Component<AboutProps, {}> {
  componentDidMount() {
    forceRedrawInWebkit();
  }

  render() {
    const t = getTranslation().serverSelector;
    const props = this.props;
    const allComponentsSorted = sortBy(this.props.clientComponents.concat(getAdditionalComponents(props.logFileLocation)), getSortKey);
    return div({className: 'aboutComponent'},
      div({
        className: classNames('aboutHeader'),
        onClick: props.onBack,
      }, span({className: 'icon-arrow-back'}), helpLink(props)),
      div({className: 'aboutBody'},
        div({className: 'aboutMain'},
          h1({}, t.title.about),
          allComponentsSorted.map(aboutInfoLine)
        )
      ),
      div({className: 'aboutFooter'},
        props.logFileLocation ?
          div({className: 'buttonGroup logFileSection'},
            span({className: 'openLogFileTitle'}, t.title.logFile),
            button({
              className: "submitButton",
              onClick: props.openLogFile
            }, t.button.openLogFile)
          )
          : [],
      )
    );
  }
}

export const aboutComponent = createPreactFactory(AboutComponent);
