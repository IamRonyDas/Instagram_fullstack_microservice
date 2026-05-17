import { ChangeEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraCapture from '../components/common/CameraCapture';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/layout/PageHeader';
import { useAppData } from '../context/AppDataContext';
import './AddPost.css';

export default function AddPost() {
  const navigate = useNavigate();
  const { addPost } = useAppData();
  const galleryRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return url;
    });
    e.target.value = '';
  };

  const handleCameraCapture = (url: string) => {
    setPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return url;
    });
    setShowCamera(false);
  };

  const handlePost = () => {
    if (!preview) return;
    addPost(preview, caption);
    navigate('/');
  };

  const privacyLabels: Record<string, string> = {
    public: 'Public',
    friends: 'Friends only',
    private: 'Only me',
  };

  return (
    <AppLayout narrow>
      <div className="add-post-page">
        <PageHeader title="Create new post" backTo="/" />

        <div className="add-post-page__body">
          {!preview ? (
            <div className="add-post-page__picker">
              <div className="add-post-page__picker-icon">+</div>
              <p className="add-post-page__picker-label">Drag photos and videos here</p>
              <div className="add-post-page__picker-actions">
                <button
                  type="button"
                  className="add-post-page__picker-btn add-post-page__picker-btn--primary"
                  onClick={() => galleryRef.current?.click()}
                >
                  Select from computer
                </button>
                <button
                  type="button"
                  className="add-post-page__picker-btn"
                  onClick={() => setShowCamera(true)}
                >
                  Take photo with camera
                </button>
              </div>
            </div>
          ) : (
            <div className="add-post-page__preview-wrap">
              <img src={preview} alt="Preview" className="add-post-page__preview" />
              <button
                type="button"
                className="add-post-page__change"
                onClick={() => setPreview(null)}
              >
                Change photo
              </button>
            </div>
          )}

          <input
            ref={galleryRef}
            type="file"
            accept="image/*,video/*"
            className="add-post-page__file-input"
            onChange={handleFile}
          />

          <label className="add-post-page__label" htmlFor="caption">
            Caption
          </label>
          <textarea
            id="caption"
            className="add-post-page__caption"
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
          />

          <div className="add-post-page__privacy-wrap">
            <button
              type="button"
              className="add-post-page__privacy-btn"
              onClick={() => setShowPrivacyMenu((v) => !v)}
            >
              Set Privacy: {privacyLabels[privacy]}
            </button>
            {showPrivacyMenu && (
              <div className="add-post-page__privacy-menu">
                {Object.entries(privacyLabels).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`add-post-page__privacy-option${privacy === key ? ' add-post-page__privacy-option--active' : ''}`}
                    onClick={() => {
                      setPrivacy(key);
                      setShowPrivacyMenu(false);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="add-post-page__submit"
            disabled={!preview}
            onClick={handlePost}
          >
            Share
          </button>
        </div>

        {showCamera && (
          <CameraCapture
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
        )}
      </div>
    </AppLayout>
  );
}
