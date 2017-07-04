import {Component} from "preact";
import {createPreactFactory, div} from "../utils/preact";


export interface ErrorMessageProps {
  message: string;
  detailedMessage?: string;
}

interface ErrorMessageState {
  showDetails: boolean;
}


class ErrorMessageComponent extends Component<ErrorMessageProps, ErrorMessageState> {
  state = {
    showDetails: false
  };

  toggleErrorDetails = () => {
    this.setState({
      showDetails: !this.state.showDetails
    });
  }

  selectDetailMessage = (event: Event) => {
    event.preventDefault();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(event.srcElement!);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  render() {
    const props = this.props;
    return div({className: 'errorMessage', },
      div({className: "errorMessageMain"}, props.message),
      this.props.detailedMessage ? div({
          className: 'detailedErrorSection'
        },
        div({className: 'detailsButton', onClick: this.toggleErrorDetails}, "DETAILS"),
        this.state.showDetails ? div({
          className: 'detailedErrorMessage',
          onClick: this.selectDetailMessage,
        }, this.props.detailedMessage) : []) : []);
  }
}

export const errorMessageComponent = createPreactFactory(ErrorMessageComponent);
