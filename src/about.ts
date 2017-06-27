import {Component} from 'preact';
import {createPreactFactory, h1, div, classNames, p, button} from "./utils/preact";
import {getTranslation} from "./localization";

interface AboutProps {
  onBack: Function;
  logFileLocation?: string;
  openLogFile: Function;
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
    return div({},
      div({
        className: classNames('aboutHeader', 'icon-arrow-back'),
        onClick: this.props.onBack,
      }),
      div({className: 'aboutMain'},
        h1({}, 'About')
      ),
      this.props.logFileLocation ?
        div({className: 'logFileContent'},
          h1({}, t.title.logFile),
          p({
            className: 'logfileLocationValue',
            onClick: this.selectLogFileLocationValue
          }, this.props.logFileLocation),
          div({className: 'buttonGroup'},
            button({
              className: "submitButton",
              onClick: this.props.openLogFile
            }, t.button.openLogFile)
          )
        ) : [],
    );
  }
}

export const aboutComponent = createPreactFactory(AboutComponent);
