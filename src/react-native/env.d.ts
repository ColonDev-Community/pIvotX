// Minimal type declarations for react-native and react-native-webview.
// The actual types ship with those packages at runtime.
// These stubs let pIvotX compile without installing them as devDeps.

declare module 'react-native' {
  export const Platform: {
    OS: 'ios' | 'android' | 'web' | 'windows' | 'macos';
    select: <T>(specifics: { [platform: string]: T }) => T;
  };
}

declare module 'react-native-webview' {
  import type { Ref } from 'react';

  export interface WebViewMessageEvent {
    nativeEvent: { data: string };
  }

  export interface WebViewProps {
    ref?:               Ref<WebView>;
    source?:            { html: string } | { uri: string };
    style?:             unknown;
    scrollEnabled?:     boolean;
    bounces?:           boolean;
    originWhitelist?:   string[];
    javaScriptEnabled?: boolean;
    onMessage?:         (event: WebViewMessageEvent) => void;
    allowFileAccess?:   boolean;
    mixedContentMode?:  'never' | 'always' | 'compatibility';
    children?:          React.ReactNode;
  }

  export class WebView extends React.Component<WebViewProps> {
    postMessage(data: string): void;
    injectJavaScript(js: string): void;
  }
}
