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

  const [previews, setPreviews] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...urls]);
    e.target.value = '';
  };

  const handleCameraCapture = (url: string) => {
    setPreviews((prev) => [...prev, url]);
    setShowCamera(false);
  };

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      const newPreviews = [...prev];
      const removed = newPreviews.splice(index, 1)[0];
      if (removed.startsWith('blob:')) URL.revokeObjectURL(removed);
      return newPreviews;
    });
  };

  const handlePost = () => {
    if (previews.length === 0) return;
    previews.forEach((preview) => {
      addPost(preview, caption, location);
    });
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
          {previews.length === 0 ? (
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
              <div className="add-post-page__previews-grid">
                {previews.map((preview, idx) => (
                  <div key={idx} className="add-post-page__preview-item">
                    <img src={preview} alt={`Preview ${idx + 1}`} className="add-post-page__preview" />
                    <button
                      type="button"
                      className="add-post-page__remove"
                      onClick={() => removePreview(idx)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="add-post-page__picker-actions">
                <button
                  type="button"
                  className="add-post-page__change"
                  onClick={() => galleryRef.current?.click()}
                >
                  Add more
                </button>
                <button
                  type="button"
                  className="add-post-page__change"
                  onClick={() => setShowCamera(true)}
                >
                  Camera
                </button>
              </div>
            </div>
          )}

          <input
            ref={galleryRef}
            type="file"
            accept="image/*,video/*"
            multiple
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

          <label className="add-post-page__label" htmlFor="location">
            Location
          </label>
          <input
            id="location"
            type="text"
            className="add-post-page__location-input"
            placeholder="Add location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
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
            disabled={previews.length === 0}
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
