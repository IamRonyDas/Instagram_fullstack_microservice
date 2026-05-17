import { ChangeEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/layout/PageHeader';
import { useAppData } from '../context/AppDataContext';
import './EditProfile.css';

export default function EditProfile() {
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useAppData();
  const fileRef = useRef<HTMLInputElement>(null);

  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatarUrl || '');

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    e.target.value = '';
  };

  const handleSave = () => {
    updateProfile({ bio: bio.trim(), avatarUrl: avatarPreview });
    navigate('/profile');
  };

  return (
    <AppLayout narrow>
      <div className="edit-profile-page">
        <PageHeader title="Edit profile" backTo="/profile" />

        <div className="edit-profile-page__body">
          <button
            type="button"
            className="edit-profile-page__avatar-btn"
            onClick={() => fileRef.current?.click()}
          >
            <img src={avatarPreview} alt="Profile" className="edit-profile-page__avatar" />
            <span className="edit-profile-page__avatar-label">Change profile photo</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="edit-profile-page__file-input"
            onChange={handleAvatarChange}
          />

          <label className="edit-profile-page__label" htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            className="edit-profile-page__bio"
            placeholder="Write a bio..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={150}
          />
          <span className="edit-profile-page__count">{bio.length}/150</span>

          <button type="button" className="edit-profile-page__save" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
