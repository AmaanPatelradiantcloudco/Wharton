import { AgentParameters } from "../dialogflow/types";

const renderMessage = (content: string, className = ""): HTMLElement => {
  return renderDiv(content, `message ${className}`);
};

const renderTypingIndicator = (): HTMLElement => {
  const indicator = renderMessage("", "conf typing-indicator");
  [1, 2, 3].forEach((i) => {
    indicator.appendChild(renderDiv("", `dot_${i}`));
  });
  return indicator;
};

const renderDiv = (content: string, className = ""): HTMLElement => {
  const element = document.createElement("div");
  element.className = `${className}`;
  element.textContent = content;
  return element;
};

type ChatUIElements = {
  messages: HTMLElement;
  form: HTMLFormElement;
  input: HTMLInputElement;
  submit: HTMLButtonElement;
};

type ChatUIProps = {
  onSubmit: (value: string) => void | Promise<void>;
};

export class ChatUI {
  elements: ChatUIElements;
  props: ChatUIProps;

  typingIndicator: Element | null = null;
  typingStatus = false;

  constructor(elements: ChatUIElements, props: ChatUIProps) {
    this.elements = elements;
    this.props = props;
    this.elements.form.addEventListener("submit", this.submit);
  }

  scroll(): void {
    window.scroll({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  append(message: string, className: string): void {
    if (this.typingStatus) {
      this.removeTypingIndicator();
    }
    this.elements.messages?.appendChild(renderMessage(message, className));
    if (this.typingStatus) {
      this.addTypingIndicator();
    }
    this.scroll();
  }

  removeTypingIndicator(): void {
    if (this.typingIndicator) {
      this.elements.messages?.removeChild(this.typingIndicator);
      this.typingIndicator = null;
    }
  }

  addTypingIndicator(): void {
    this.typingIndicator = renderTypingIndicator();
    this.elements.messages?.appendChild(this.typingIndicator);
  }

  setConversationEnded(status: boolean): void {
    if (status) {
      this.append("The conversation is no longer active.", "ended");
      this.elements.input.setAttribute("disabled", "true");
      this.elements.submit.setAttribute("disabled", "true");
    }
  }

  setTypingStatus(status: boolean): void {
    this.typingStatus = status;
    if (!this.typingIndicator && status) {
      this.addTypingIndicator();
      this.scroll();
    } else if (!status && this.typingIndicator) {
      this.removeTypingIndicator();
    }
  }

  submit = (event: Event): void => {
    event.preventDefault();
    const value = this.elements.input?.value;
    this.elements.input.value = "";
    this.props.onSubmit(value);
  };
}

type DebugUIElements = {
  info: HTMLElement;
};

export class DebugUI {
  parametersElement: HTMLElement;
  pageElement: HTMLElement;
  pages: string[] = [];

  constructor(elements: DebugUIElements) {
    this.parametersElement = renderDiv("", "");
    this.pageElement = renderDiv("", "");
    elements.info.appendChild(this.parametersElement);
    elements.info.appendChild(this.pageElement);
  }

  setParameters(parameters: AgentParameters): void {
    this.parametersElement.textContent = "";
    const keys = Object.keys(parameters).sort();
    keys.map((key) => {
      const paramString = `${key}: ${parameters[key]}`;
      this.parametersElement.appendChild(renderDiv(paramString, "param"));
    });
  }

  setPage(page: string): void {
    const count = this.pages.length + 1;
    this.pages.unshift(`${count}. ${page}`);
    this.pageElement.textContent = "";
    this.pages.map((page) => {
      this.pageElement.appendChild(renderDiv(page, "page"));
    });
  }
}

type ErrorUIElements = {
  errors: HTMLElement;
};

export class ErrorUI {
  elements: ErrorUIElements;

  constructor(elements: ErrorUIElements) {
    this.elements = elements;
  }

  setErrors(errors: string[]): void {
    this.elements.errors.textContent = "";
    errors.map((error: string) => {
      this.elements.errors.appendChild(renderDiv(error, "message"));
    });
  }
}

type UIElements = ChatUIElements & DebugUIElements & ErrorUIElements;

export class UI {
  ui: ChatUI;
  debugUi: DebugUI;
  errorUi: ErrorUI;

  constructor(elements: UIElements, props: ChatUIProps) {
    const { messages, form, input, submit, errors, info } = elements;

    this.ui = new ChatUI({ messages, form, input, submit }, props);
    this.debugUi = new DebugUI({ info });
    this.errorUi = new ErrorUI({ errors });
  }

  appendAgentMessage(message: string): void {
    this.ui.append(message, "conf");
  }

  setTypingStatus(status: boolean): void {
    this.ui.setTypingStatus(status);
  }

  appendParticipantMessage(message: string): void {
    this.ui.append(message, "participant");
  }

  setConversationEnded(status: boolean): void {
    this.ui.setConversationEnded(status);
  }

  setParameters(parameters: AgentParameters): void {
    this.debugUi.setParameters(parameters);
  }

  setPage(page: string): void {
    this.debugUi.setPage(page);
  }

  setErrors(errors: string[]): void {
    this.errorUi.setErrors(errors);
  }
}
