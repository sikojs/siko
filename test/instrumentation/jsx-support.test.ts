/**
 * Comprehensive tests for JSX/TSX support
 */

import { instrumentCode } from '../../src/instrumentation/instrumenter';

describe('JSX/TSX Support', () => {
  describe('Basic JSX components', () => {
    test('should instrument basic JSX function component', () => {
      const code = `
function Button() {
  return <button>Click me</button>;
}
`;

      const instrumented = instrumentCode(code, { filename: 'test.jsx' });

      expect(instrumented).toContain('__siko_track("Button:');
      expect(instrumented).toContain('<button>Click me</button>');
    });

    test('should instrument arrow function returning JSX', () => {
      const code = `
const Component = () => <div>Hello</div>;
`;

      const instrumented = instrumentCode(code, { filename: 'test.tsx' });

      expect(instrumented).toContain('__siko_track("Component:');
      expect(instrumented).toContain('return <div>Hello</div>');
    });

    test('should instrument arrow function with JSX block', () => {
      const code = `
const Component = () => {
  return <div>Hello</div>;
};
`;

      const instrumented = instrumentCode(code, { filename: 'test.jsx' });

      expect(instrumented).toContain('__siko_track("Component:');
      expect(instrumented).toContain('return <div>Hello</div>');
    });

    test('should instrument exported JSX component', () => {
      const code = `
export function Header() {
  return <header>My App</header>;
}
`;

      const instrumented = instrumentCode(code, { filename: 'test.tsx' });

      expect(instrumented).toContain('__siko_track("Header:');
      expect(instrumented).toContain('<header>My App</header>');
    });
  });

  describe('JSX with conditional rendering', () => {
    test('should handle JSX in conditional returns', () => {
      const code = `
const Component = ({ show }) => {
  if (show) return <div>Visible</div>;
  return <div>Hidden</div>;
};
`;

      const instrumented = instrumentCode(code, { filename: 'test.jsx' });

      expect(instrumented).toContain('__siko_track("Component:');
      expect(instrumented).toContain('if (show) return <div>Visible</div>');
      expect(instrumented).toContain('return <div>Hidden</div>');
    });

    test('should handle JSX with logical operators', () => {
      const code = `
const Component = ({ isLoggedIn }) => {
  return isLoggedIn && <div>Welcome</div>;
};
`;

      const instrumented = instrumentCode(code, { filename: 'test.tsx' });

      expect(instrumented).toContain('__siko_track("Component:');
      expect(instrumented).toContain('isLoggedIn && <div>Welcome</div>');
    });

    test('should handle JSX with ternary operator', () => {
      const code = `
const Component = ({ loading }) => {
  return loading ? <div>Loading...</div> : <div>Content</div>;
};
`;

      const instrumented = instrumentCode(code, { filename: 'test.jsx' });

      expect(instrumented).toContain('__siko_track("Component:');
      expect(instrumented).toContain('loading ? <div>Loading...</div> : <div>Content</div>');
    });
  });

  describe('JSX fragments', () => {
    test('should handle JSX fragments with shorthand syntax', () => {
      const code = `
const Component = () => (
  <>
    <Header />
    <Content />
  </>
);
`;

      const instrumented = instrumentCode(code, { filename: 'test.tsx' });

      expect(instrumented).toContain('__siko_track("Component:');
      expect(instrumented).toContain('<Header />');
      expect(instrumented).toContain('<Content />');
    });

    test('should handle JSX fragments with React.Fragment', () => {
      const code = `
const Component = () => {
  return (
    <React.Fragment>
      <div>First</div>
      <div>Second</div>
    </React.Fragment>
  );
};
`;

      const instrumented = instrumentCode(code, { filename: 'test.jsx' });

      expect(instrumented).toContain('__siko_track("Component:');
      expect(instrumented).toContain('<React.Fragment>');
    });
  });

  describe('JSX with props and destructuring', () => {
    test('should handle JSX with props', () => {
      const code = `
const Button = ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>;
};
`;

      const instrumented = instrumentCode(code, { filename: 'test.tsx' });

      expect(instrumented).toContain('__siko_track("Button:');
      expect(instrumented).toContain('<button onClick={onClick}>{label}</button>');
    });

    test('should handle JSX with spread props', () => {
      const code = `
const Component = (props) => {
  return <div {...props}>Content</div>;
};
`;

      const instrumented = instrumentCode(code, { filename: 'test.jsx' });

      expect(instrumented).toContain('__siko_track("Component:');
      expect(instrumented).toContain('<div {...props}>Content</div>');
    });
  });

  describe('Higher-order components', () => {
    test('should instrument higher-order component', () => {
      const code = `
const withAuth = (Component) => {
  return (props) => {
    return <Component {...props} />;
  };
};
`;

      const instrumented = instrumentCode(code, { filename: 'test.tsx' });

      expect(instrumented).toContain('__siko_track("withAuth:');
      // Note: The returned arrow function is still anonymous (not assigned to a variable)
      // so it won't be instrumented - this is expected
    });

    test('should instrument named HOC wrapper', () => {
      const code = `
function withLogging(Component) {
  function LoggingWrapper(props) {
    console.log('Rendering');
    return <Component {...props} />;
  }
  return LoggingWrapper;
}
`;

      const instrumented = instrumentCode(code, { filename: 'test.jsx' });

      expect(instrumented).toContain('__siko_track("withLogging:');
      expect(instrumented).toContain('__siko_track("LoggingWrapper:');
    });
  });

  describe('React patterns', () => {
    test('should handle React.memo wrapped component', () => {
      const code = `
const MemoizedComponent = React.memo(() => {
  return <div>Memoized</div>;
});
`;

      const instrumented = instrumentCode(code, { filename: 'test.tsx' });

      // Now tracks the variable name by walking up the AST tree
      expect(instrumented).toContain('__siko_track("MemoizedComponent:');
      expect(instrumented).toContain('<div>Memoized</div>');
      expect(instrumented).toContain('React.memo');
    });

    test('should handle forwardRef', () => {
      const code = `
const FancyInput = React.forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});
`;

      const instrumented = instrumentCode(code, { filename: 'test.jsx' });

      // Now tracks the variable name by walking up the AST tree
      expect(instrumented).toContain('__siko_track("FancyInput:');
      expect(instrumented).toContain('<input ref={ref} {...props} />');
      expect(instrumented).toContain('React.forwardRef');
    });
  });

  describe('Async components', () => {
    test('should instrument async arrow function component', () => {
      const code = `
const AsyncComponent = async () => {
  const data = await fetchData();
  return <div>{data}</div>;
};
`;

      const instrumented = instrumentCode(code, { filename: 'test.tsx' });

      expect(instrumented).toContain('__siko_track("AsyncComponent:');
      expect(instrumented).toContain('await fetchData()');
      expect(instrumented).toContain('<div>{data}</div>');
    });

    test('should instrument async function declaration', () => {
      const code = `
async function DataLoader() {
  const response = await fetch('/api/data');
  const data = await response.json();
  return <div>{data.title}</div>;
}
`;

      const instrumented = instrumentCode(code, { filename: 'test.jsx' });

      expect(instrumented).toContain('__siko_track("DataLoader:');
      expect(instrumented).toContain('await fetch');
    });
  });

  describe('TypeScript JSX with types', () => {
    test('should handle TypeScript JSX with interface props', () => {
      const code = `
interface Props {
  title: string;
  count: number;
}

const Component = ({ title, count }: Props) => {
  return <div>{title}: {count}</div>;
};
`;

      const instrumented = instrumentCode(code, { filename: 'test.tsx' });

      expect(instrumented).toContain('__siko_track("Component:');
      expect(instrumented).toContain('<div>{title}: {count}</div>');
    });

    test('should handle TypeScript JSX with generic components', () => {
      const code = `
function List<T>({ items }: { items: T[] }) {
  return <ul>{items.map(item => <li key={item}>{item}</li>)}</ul>;
}
`;

      const instrumented = instrumentCode(code, { filename: 'test.tsx' });

      expect(instrumented).toContain('__siko_track("List:');
      expect(instrumented).toContain('<ul>');
    });

    test('should handle arrow function with TypeScript generics', () => {
      const code = `
const GenericComponent = <T,>({ data }: { data: T }) => {
  return <div>{JSON.stringify(data)}</div>;
};
`;

      const instrumented = instrumentCode(code, { filename: 'test.tsx' });

      expect(instrumented).toContain('__siko_track("GenericComponent:');
      expect(instrumented).toContain('<div>');
    });
  });

  describe('Nested components', () => {
    test('should instrument nested JSX components', () => {
      const code = `
const Outer = () => {
  const Inner = () => <span>Inner</span>;
  return <div><Inner /></div>;
};
`;

      const instrumented = instrumentCode(code, { filename: 'test.jsx' });

      expect(instrumented).toContain('__siko_track("Outer:');
      expect(instrumented).toContain('__siko_track("Inner:');
    });

    test('should handle deeply nested JSX', () => {
      const code = `
const Card = () => {
  return (
    <div className="card">
      <div className="header">
        <h2>Title</h2>
      </div>
      <div className="body">
        <p>Content</p>
      </div>
    </div>
  );
};
`;

      const instrumented = instrumentCode(code, { filename: 'test.tsx' });

      expect(instrumented).toContain('__siko_track("Card:');
      expect(instrumented).toContain('<div className="card">');
      expect(instrumented).toContain('<h2>Title</h2>');
    });
  });

  describe('Class components', () => {
    test('should instrument class component render method', () => {
      const code = `
class MyComponent extends React.Component {
  render() {
    return <div>Hello</div>;
  }
}
`;

      const instrumented = instrumentCode(code, { filename: 'test.jsx' });

      expect(instrumented).toContain('__siko_track("render:');
      expect(instrumented).toContain('<div>Hello</div>');
    });

    test('should instrument class component lifecycle methods', () => {
      const code = `
class MyComponent extends React.Component {
  componentDidMount() {
    console.log('mounted');
  }

  render() {
    return <div>Content</div>;
  }
}
`;

      const instrumented = instrumentCode(code, { filename: 'test.tsx' });

      expect(instrumented).toContain('__siko_track("componentDidMount:');
      expect(instrumented).toContain('__siko_track("render:');
    });
  });

  describe('JSX with complex expressions', () => {
    test('should handle JSX with array mapping', () => {
      const code = `
const List = ({ items }) => {
  return (
    <ul>
      {items.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  );
};
`;

      const instrumented = instrumentCode(code, { filename: 'test.jsx' });

      expect(instrumented).toContain('__siko_track("List:');
      expect(instrumented).toContain('items.map');
    });

    test('should handle JSX with callbacks', () => {
      const code = `
const Form = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return <form onSubmit={handleSubmit}><button type="submit">Submit</button></form>;
};
`;

      const instrumented = instrumentCode(code, { filename: 'test.tsx' });

      expect(instrumented).toContain('__siko_track("Form:');
      expect(instrumented).toContain('__siko_track("handleSubmit:');
    });
  });
});
