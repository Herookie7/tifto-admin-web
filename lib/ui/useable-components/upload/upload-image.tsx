// Contexts
// import { ConfigurationContext } from '@/lib/context/global/configuration.context';
import { ToastContext } from '@/lib/context/global/toast.context';

// GraphQL
import { useMutation } from '@apollo/client';
import { UPLOAD_IMAGE_TO_S3 } from '@/lib/api/graphql/mutations';

// Interfaces
import {
  IImageUploadComponentProps,
} from '@/lib/utils/interfaces';
import Image from 'next/image';

// Hooks
import { memo, useCallback, useContext, useState, useEffect } from 'react';

// Utils
import { compressImage } from '@/lib/utils/methods';

// Components
import CustomLoader from '../custom-progress-indicator';

// Prime React
import {
  FileUpload,
  FileUploadSelectEvent,
  ItemTemplateOptions,
} from 'primereact/fileupload';

// Icons
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'use-intl';
// import { MAX_VIDEO_FILE_SIZE } from '@/lib/utils/constants';

function CustomUploadImageComponent({
  name,
  title,
  page,
  // onChange,
  onSetImageUrl,
  existingImageUrl,
  style,
  fileTypes = [
    'image/webp',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'video/webm',
    'video/mp4',
  ],
}: IImageUploadComponentProps) {
  // Context
  // const configuration: IConfiguration | undefined =
  //   useContext(ConfigurationContext);
  const { showToast } = useContext(ToastContext);

  // Mutations
  const [uploadToS3] = useMutation(UPLOAD_IMAGE_TO_S3);

  // States
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState('');
  const [currentFileType, setCurrentFileType] = useState('');
  const [imageValidationErr, setImageValidationErr] = useState({
    bool: false,
    msg: '',
  });
  const [uploadMode, setUploadMode] = useState<'upload' | 'link'>('upload');
  const [imageLink, setImageLink] = useState('');

  // Hooks
  const t = useTranslations();

  // Filter Files
  const filterFiles = (event: FileUploadSelectEvent): File | undefined => {
    const files = Array.from(event.files || []);
    const extracted_files = files.filter((file) =>
      file.name.match(/\.(jpg|jpeg|png|gif|webp|avif|mp4|webm)$/)
    );
    return extracted_files.length ? extracted_files[0] : files[0];
  };

  // Upload to S3
  const uploadImageToS3 = useCallback(
    async (file: File): Promise<void> => {
      setIsUploading(true);
      setImageFile(URL.createObjectURL(file));
      
      try {
        // Compress image if it's an image file
        const processedFile = file.type.startsWith('image/') 
          ? await compressImage(file, 800, 0.7)
          : file;
        
        // Convert to base64
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(processedFile);
        });
        
        const { data } = await uploadToS3({
          variables: { image: base64 }
        });
        
        const imageUrl = data?.uploadImageToS3?.imageUrl;
        
        if (imageUrl) {
          onSetImageUrl(name, imageUrl);
          showToast({
            type: 'info',
            title: title,
            message: `${fileTypes.includes('video/webm') || fileTypes.includes('video/mp4') ? t('File') : t('Image')} ${t('has been uploaded successfully')}.`,
            duration: 2500,
          });
        } else {
          throw new Error('No image URL returned');
        }
      } catch (error) {
        onSetImageUrl(name, '');
        showToast({
          type: 'error',
          title: title,
          message: `${fileTypes.includes('video/webm') || fileTypes.includes('video/mp4') ? t('File') : t('Image')} ${t('Upload Failed')}`,
          duration: 2500,
        });
        setImageValidationErr({
          bool: true,
          msg: 'Upload failed',
        });
        setImageFile('');
      } finally {
        setIsUploading(false);
      }
    },
    [name, onSetImageUrl, showToast, title, fileTypes, uploadToS3, t]
  );

  // Select Image
  const handleFileSelect = useCallback(
    (event: FileUploadSelectEvent): void => {
      const result = filterFiles(event);
      if (result) {
        setCurrentFileType(result.type);
        uploadImageToS3(result);
      }
    },
    [uploadImageToS3]
  );

  // Handle cancel click
  const handleCancelClick = (type: String) => {
    if (type === 'cancel') {
      setImageFile('');
      setImageLink('');
      setImageValidationErr({
        bool: false,
        msg: '',
      });
      onSetImageUrl(name, '');
    } else {
      return;
    }
  };

  // Validate and set image link
  const handleLinkSubmit = useCallback(() => {
    if (!imageLink.trim()) {
      setImageValidationErr({
        bool: true,
        msg: t('Please enter an image URL'),
      });
      return;
    }

    const trimmedLink = imageLink.trim();
    
    // Accept data URLs (base64 images)
    if (trimmedLink.startsWith('data:image/')) {
      onSetImageUrl(name, trimmedLink);
      setImageValidationErr({
        bool: false,
        msg: '',
      });
      showToast({
        type: 'info',
        title: title,
        message: t('Image link has been set successfully'),
        duration: 2500,
      });
      return;
    }

    // Validate HTTP/HTTPS URLs
    try {
      const url = new URL(trimmedLink);
      
      // Accept any valid HTTP/HTTPS URL (MongoDB stores as string)
      // This allows flexibility for various image hosting services
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        onSetImageUrl(name, trimmedLink);
        setImageValidationErr({
          bool: false,
          msg: '',
        });
        showToast({
          type: 'info',
          title: title,
          message: t('Image link has been set successfully'),
          duration: 2500,
        });
      } else {
        throw new Error('Invalid URL protocol');
      }
    } catch (error) {
      setImageValidationErr({
        bool: true,
        msg: t('Please enter a valid image URL'),
      });
      onSetImageUrl(name, '');
    }
  }, [imageLink, name, onSetImageUrl, showToast, title, t]);

  // Initialize image link when existingImageUrl changes
  useEffect(() => {
    if (existingImageUrl && uploadMode === 'link') {
      setImageLink(existingImageUrl);
    }
  }, [existingImageUrl, uploadMode]);

  // Handle mode change
  const handleModeChange = (mode: 'upload' | 'link') => {
    setUploadMode(mode);
    setImageFile('');
    setImageValidationErr({
      bool: false,
      msg: '',
    });
    if (mode === 'link' && existingImageUrl) {
      setImageLink(existingImageUrl);
    } else if (mode === 'link' && !existingImageUrl) {
      setImageLink('');
    }
  };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <span className="mx-auto self-start text-sm font-[600]">{title}</span>
      
      {/* Mode Toggle */}
      <div className="flex gap-2 w-full mb-2">
        <button
          type="button"
          onClick={() => handleModeChange('upload')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            uploadMode === 'upload'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {t('Upload Image')}
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('link')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            uploadMode === 'link'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {t('Paste Link')}
        </button>
      </div>

      {uploadMode === 'link' ? (
        /* Link Input Mode */
        <div className="w-full flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={imageLink}
              onChange={(e) => setImageLink(e.target.value)}
              placeholder={t('Enter image URL (e.g., https://example.com/image.jpg)')}
              className={`flex-1 px-3 py-2 border rounded-md ${
                imageValidationErr.bool ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLinkSubmit();
                }
              }}
            />
            <button
              type="button"
              onClick={handleLinkSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              {t('Set Link')}
            </button>
          </div>
          {imageValidationErr.bool && (
            <p className="text-xs text-red-600">{imageValidationErr.msg}</p>
          )}
          {(existingImageUrl || imageLink) && !imageValidationErr.bool && (
            <div className="mt-2 w-full h-48 border border-gray-300 rounded-md overflow-hidden">
              <Image
                src={existingImageUrl || imageLink}
                alt="Preview"
                width={400}
                height={300}
                className="w-full h-full object-contain"
                onError={() => {
                  setImageValidationErr({
                    bool: true,
                    msg: t('Failed to load image. Please check the URL.'),
                  });
                }}
              />
            </div>
          )}
        </div>
      ) : (
        /* Upload Mode */
        <div
          style={style}
          className={
            page && page === 'vendor-profile-edit'
              ? `bg-transparnt`
              : `mx-auto flex h-48 w-48 flex-col items-center justify-start border-2 border-dashed ${imageValidationErr.bool ? 'border-red-900' : 'border-gray-300'}`
          }
        >
        <FileUpload
          accept={fileTypes?.join(',')}
          id={`${name}-upload`}
          className="mx-auto -mt-7 h-28 w-44 items-center justify-center rounded-md bg-transparent"
          onSelect={(e) => handleFileSelect(e)}
          emptyTemplate={() => {
            return (
              <div className="mx-auto h-auto w-40">
                {!isUploading && (
                  <div
                    className={`flex h-auto w-full flex-col items-center justify-center pt-5 text-center`}
                  >
                    {(page && page === 'vendor-profile-edit') ?? (
                      <>
                        <FontAwesomeIcon icon={faUpload} size="sm" />
                        <p className="w-36 text-xs text-gray-600">
                          {t('Drag & Drop Image Here')}
                        </p>
                      </>
                    )}

                    <div className="flex w-12 flex-col items-center justify-center">
                      <div className="relative my-2 h-12 w-12 overflow-hidden rounded-md">
                        {existingImageUrl ? (
                          existingImageUrl.includes('video/') ? (
                            <video
                              src={existingImageUrl}
                              width={100}
                              height={100}
                              autoPlay
                              muted
                            />
                          ) : (
                            <Image
                              alt="User avatar"
                              src={existingImageUrl}
                              width={100}
                              height={100}
                            />
                          )
                        ) : imageFile ? (
                          <Image
                            alt="User avatar"
                            src={imageFile}
                            width={100}
                            height={100}
                          />
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }}
          headerTemplate={(options) => {
            const { chooseButton, cancelButton } = options;
            return (
              <button
                type="button"
                onClick={() =>
                  handleCancelClick(imageFile ? 'cancel' : 'choose')
                }
              >
                {!imageFile || !imageValidationErr.bool
                  ? chooseButton
                  : cancelButton}
              </button>
            );
          }}
          chooseLabel={t('Upload Image')}
          chooseOptions={
            page === 'vendor-profile-edit'
              ? {
                  className: `z-50 bg-white max-[500px]:ml-[-20px] ${!imageFile ? 'text-gray-700' : imageValidationErr.bool && !imageFile ? 'text-[#E4E4E7]' : 'text-[#E4E4E7]'} border border-[#E4E4E7] rounded-md items-center justify-center relative left-[20%] translate-y-[45px] w-[173px] h-[40px] text-[14px] gap-[5px] font-medium`,
                  label: t('Upload Image'),
                  icon: () => <FontAwesomeIcon icon={faArrowUpFromBracket} />,
                }
              : {
                  className: `z-50 bg-gray-200 ${!imageFile ? 'text-gray-700' : imageValidationErr.bool && !imageFile ? 'text-red-900' : 'text-gray-700'} border border-gray-500 rounded-md items-center justify-center relative left-[20%] translate-y-[45px] w-32 h-8 text-xs`,
                  label: t('Browse Files'),
                  icon: () => <></>,
                }
          }
          cancelOptions={{
            className: 'text-xs',
          }}
          // maxFileSize={maxFileSize}
          customUpload={true}
          itemTemplate={(file: object, object: ItemTemplateOptions) => {
            const extractedFile = file as File;
            // if(page && page === "vendor-profile-edit"){
            //   onChange(URL.createObjectURL(extractedFile));
            // }
            return (
              <div className="h-12">
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-opacity-50">
                    <CustomLoader />
                  </div>
                )}
                {!isUploading && (
                  <div className="top-0 flex items-center justify-center gap-1">
                    <div
                      className={
                        page && page === 'vendor-profile-edit'
                          ? 'flex h-8 w-12 items-center justify-start overflow-hidden rounded-md mt-[30px]'
                          : 'flex h-8 w-12 items-center justify-start overflow-hidden rounded-md'
                      }
                    >
                      {currentFileType.startsWith('video/') ? (
                        <video
                          src={URL.createObjectURL(extractedFile)}
                          width={100}
                          height={100}
                          autoPlay
                          muted
                        />
                      ) : (
                        <Image
                          src={URL.createObjectURL(extractedFile)}
                          width={100}
                          height={100}
                          alt={object.fileNameElement.props}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          }}
        />
        </div>
      )}
      {uploadMode === 'upload' && (
        <div className="mx-auto text-[10px] font-[600] text-red-800">
          {imageValidationErr.msg}
        </div>
      )}
    </div>
  );
}

export default memo(CustomUploadImageComponent);
