declare global {
  var window: {
    location: {
      href: string;
      pathname: string;
      search: string;
      hash: string;
      origin: string;
    };
  } | undefined;
}

export {};