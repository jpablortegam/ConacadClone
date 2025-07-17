import React from 'react';

export default function Button() {
  const handleClick = () => {
    console.log('clicked');
  };

  return (
    <button
      onClick={handleClick}
      className="rounded bg-blue-500 px-4 py-2 font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-600 hover:shadow-lg"
    >
      Click me
    </button>
  );
}
