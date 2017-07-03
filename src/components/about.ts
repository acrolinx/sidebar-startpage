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

export const HELP_LINK_URL = 'https://support.acrolinx.com/hc/en-us/sections/201284252';

function aboutInfoLine(component: SoftwareComponent) {
  return div({className: 'about-item', key: component.id},
    div({className: 'about-tab-label'}, component.name),
    div({className: 'about-tab-value', title: component.version}, component.version));
}

function getSortKey(softwareComponent: SoftwareComponent) {
  const prefix = (softwareComponent.category === SoftwareComponentCategory.MAIN) ? '1' : '2';
  return prefix + softwareComponent.name.toLowerCase();
}

function getAdditionalComponents(): SoftwareComponent[] {
  return [
    {
      id: 'com.acrolinx.userAgent',
      name: navigator.userAgent,
      version: '',
      category: SoftwareComponentCategory.DETAIL
    },
    {
      id: "com.acrolinx.startPageCorsOrigin",
      name: 'Start Page Cors Origin',
      version: getCorsOrigin()
    }
  ];
}


class AboutComponent extends Component<AboutProps, {}> {
  render() {
    const t = getTranslation().serverSelector;
    const props = this.props;
    const allComponentsSorted = sortBy(this.props.clientComponents.concat(getAdditionalComponents()), getSortKey);
    return div({className: 'aboutComponent'},
      div({
        className: classNames('aboutHeader'),
        onClick: props.onBack,
      }, span({className: 'icon-arrow-back'})),
      div({className: 'aboutBody'},
        div({className: 'aboutMain'},
          h1({}, 'About'),
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
          text: "Need help?"
        })
      )
    );
  }
}

export const aboutComponent = createPreactFactory(AboutComponent);
