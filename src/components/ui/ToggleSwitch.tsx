"use client";

interface ToggleSwitchProps {
  isActive: boolean;
  isToggling: boolean;
  onToggle: () => void;
}

export default function ToggleSwitch({ isActive, isToggling, onToggle }: ToggleSwitchProps) {
  return (
    <button
      disabled={isToggling}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        isActive ? 'bg-green-500' : 'bg-gray-300'
      } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={isActive ? "Active" : "Inactive"}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isActive ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
