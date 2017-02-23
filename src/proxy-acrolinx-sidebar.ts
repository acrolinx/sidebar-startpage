
import {
  AcrolinxSidebar, InitParameters,
  SidebarConfiguration, CheckOptions, Check, InvalidDocumentPart, CheckedDocumentRange
} from "./acrolinx-sidebar-integration/acrolinx-libs/plugin-interfaces";


export class ProxyAcrolinxSidebar implements AcrolinxSidebar {
  constructor(private acrolinxSidebar: AcrolinxSidebar, private serverAddress: string) {
  }

  init(initParameters: InitParameters): void {
    const hackedInitParameters = {...initParameters, serverAddress: this.serverAddress, showServerSelector: false};
    this.acrolinxSidebar.init(hackedInitParameters);
  }

  configure(initParameters: SidebarConfiguration): void {
    this.acrolinxSidebar.configure(initParameters);
  }

  checkGlobal(documentContent: string, options: CheckOptions): Check {
    return this.acrolinxSidebar.checkGlobal(documentContent, options);
  }

  onGlobalCheckRejected(): void {
    this.acrolinxSidebar.onGlobalCheckRejected();
  }

  invalidateRanges(invalidCheckedDocumentRanges: InvalidDocumentPart[]) {
    this.acrolinxSidebar.invalidateRanges(invalidCheckedDocumentRanges);
  }

  onVisibleRangesChanged(checkedDocumentRanges: CheckedDocumentRange[]) {
    return this.acrolinxSidebar.onVisibleRangesChanged(checkedDocumentRanges);
  }
}
