import {Component} from 'preact';
import {createPreactFactory, h1, div, classNames, p, button, span} from "../utils/preact";
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
  selectLogFileLocationValue = (event: Event) => {
    event.preventDefault();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(event.srcElement!);
    selection.removeAllRanges();
    selection.addRange(range);
  }

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
        ),
        props.logFileLocation ?
          div({className: 'logFileContent'},
            h1({}, t.title.logFile),
            p({
              className: 'logfileLocationValue',
              onClick: this.selectLogFileLocationValue
            }, props.logFileLocation),
            div({className: 'buttonGroup'},
              button({
                className: "submitButton",
                onClick: props.openLogFile
              }, t.button.openLogFile)
            )
          ) : [],
        externalTextLink({
          url: HELP_LINK_URL,
          openWindow: props.openWindow,
          text: "Need help?"
        })
      ));
  }
}

export const aboutComponent = createPreactFactory(AboutComponent);
