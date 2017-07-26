import {Component} from "preact";
import {button, classNames, createPreactFactory, div, h1, span} from "../utils/preact";
import {getTranslation} from "../localization";
import {
  SoftwareComponent,
  SoftwareComponentCategory
} from "../acrolinx-sidebar-integration/acrolinx-libs/plugin-interfaces";
import {getCorsOrigin, sortBy} from "../utils/utils";
import {externalTextLink, OpenWindowFunction} from "./external-text-link";

interface AboutProps {
  onBack: Function;
  openLogFile: Function;
  clientComponents: SoftwareComponent[];
  logFileLocation?: string;
  openWindow: OpenWindowFunction;
}

export const HELP_LINK_URL = 'https://support.acrolinx.com/hc/en-us/articles/203845751';

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
  render() {
    const t = getTranslation().serverSelector;
    const props = this.props;
    const allComponentsSorted = sortBy(this.props.clientComponents.concat(getAdditionalComponents(props.logFileLocation)), getSortKey);
    return div({className: 'aboutComponent'},
      div({
        className: classNames('aboutHeader'),
        onClick: props.onBack,
      }, span({className: 'icon-arrow-back'})),
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
        externalTextLink({
          url: HELP_LINK_URL,
          openWindow: props.openWindow,
          text: t.links.needHelp
        })
      )
    );
  }
}

export const aboutComponent = createPreactFactory(AboutComponent);
