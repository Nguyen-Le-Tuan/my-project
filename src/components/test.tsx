import React from 'react';

interface TestComponentProps {
  name: string;
}

const TestComponent: React.FC<TestComponentProps> = ({ name }) => {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>This is a test component to check TSX support.</p>
    </div>
  );
};

export default TestComponent;
