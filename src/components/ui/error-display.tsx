
interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay = ({ error }: ErrorDisplayProps) => (
  <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 flex-col p-4">
    <p className="text-red-500 text-center mb-2">{error}</p>
    <p className="text-gray-500 text-sm text-center mb-2">
      Try uploading a different image or refreshing the page.
    </p>
  </div>
);
