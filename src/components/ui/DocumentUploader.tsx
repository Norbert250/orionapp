import React from 'react';

interface DocumentUploaderProps {
  label: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  required?: boolean;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  label,
  files,
  onFilesChange,
  accept = ".pdf,.jpg,.jpeg,.png",
  multiple = false,
  required = false,
}) => {
  const handleFileUpload = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles = Array.from(fileList);
    if (multiple) {
      onFilesChange([...files, ...newFiles]);
    } else {
      onFilesChange(newFiles);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileUpload(e.target.files)}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      
      {files.length > 0 && (
        <div className="space-y-1">
          {files.map((file, index) => (
            <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <span className="text-sm text-gray-700">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;