import {Component} from 'preact';
import {createPreactFactory, h1, div, classNames, p, button} from "./utils/preact";
import {getTranslation} from "./localization";
import {SoftwareComponent} from "./acrolinx-sidebar-integration/acrolinx-libs/plugin-interfaces";

interface AboutProps {
  onBack: Function;
  openLogFile: Function;
  clientComponents: SoftwareComponent[];
  logFileLocation?: string;
}

function aboutInfoLine(component: SoftwareComponent) {
  return div({className: 'about-item', key: component.id},
    div({className: 'about-tab-label'}, component.name),
    div({className: 'about-tab-value', title: component.version}, component.version));
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
    let props = this.props;
    return div({},
      div({
        className: classNames('aboutHeader', 'icon-arrow-back'),
        onClick: props.onBack,
      }),
      div({className: 'aboutMain'},
        h1({}, 'About'),
        props.clientComponents.map(aboutInfoLine)
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
    );
  }
}

export const aboutComponent = createPreactFactory(AboutComponent);
