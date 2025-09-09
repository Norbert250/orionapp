import React, { useState } from 'react';
import type { Asset } from '../../types';
import { mockAssetValueCheck } from '../../api/submitform';

interface AssetUploaderProps {
  assets: Asset[];
  onAssetsChange: (assets: Asset[]) => void;
}

const AssetUploader: React.FC<AssetUploaderProps> = ({ assets, onAssetsChange }) => {
  const [loading, setLoading] = useState<number | null>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setLoading(assets.length + i);

      try {
        const { value, requiresLicense } = await mockAssetValueCheck(file);
        const newAsset: Asset = {
          file,
          value,
          requiresLicense,
        };

        onAssetsChange([...assets, newAsset]);
      } catch (error) {
        console.error('Error checking asset value:', error);
      } finally {
        setLoading(null);
      }
    }
  };

  const handleLicenseUpload = (index: number, file: File) => {
    const updatedAssets = [...assets];
    updatedAssets[index].license = file;
    onAssetsChange(updatedAssets);
  };

  const removeAsset = (index: number) => {
    const updatedAssets = assets.filter((_, i) => i !== index);
    onAssetsChange(updatedAssets);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Asset Pictures (3-10 required)
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={assets.length >= 10}
        />
        <p className="text-xs text-gray-500 mt-1">
          {assets.length}/10 assets uploaded (minimum 3 required)
        </p>
      </div>

      {loading !== null && (
        <div className="text-blue-600">Checking asset value...</div>
      )}

      <div className="space-y-3">
        {assets.map((asset, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium">{asset.file.name}</p>
                <p className="text-sm text-gray-600">
                  Estimated value: ${asset.value?.toLocaleString()}
                </p>
                {asset.value && asset.value < 1000 && (
                  <p className="text-sm text-red-600">
                    ⚠️ Low asset value - consider adding more valuable items
                  </p>
                )}
              </div>
              <button
                onClick={() => removeAsset(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>

            {asset.requiresLicense && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Required
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLicenseUpload(index, file);
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-50"
                />
                {asset.license && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ License uploaded: {asset.license.name}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetUploader;