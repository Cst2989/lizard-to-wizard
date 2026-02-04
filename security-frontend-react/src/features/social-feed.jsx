import  { useState, useRef } from 'react';
import Dompurify from 'dompurify'
import "./styles.css"
const usersData = [
  { id: 1, name: 'Dan', bio: 'Enthusiastic about <b>technology</b> and <i>innovation</i>.<img src="invalid-image" onerror="alert(`XSS Attack!`)" />' },
  { id: 2, name: 'Bob', bio: 'Loves <b>hiking</b> and <i>outdoor adventures</i>.' },
  { id: 3, name: 'Charlie', bio: 'Avid reader and <b>history</b> enthusiast.' },
  { id: 4, name: 'Diana', bio: 'Passionate about <i>photography</i> and <b>travel</b>.' },
  { id: 5, name: 'Ethan', bio: 'Developer with a love for <b>open-source</b> projects.' },
  { id: 6, name: 'Fiona', bio: 'Graphic designer and <i>art</i> lover.' },
  { id: 7, name: 'George', bio: 'Dedicated to fitness and <b>healthy living</b>.' },
  { id: 8, name: 'Hannah', bio: 'Musician and <i>songwriter</i>.' },
  { id: 9, name: 'Ivan', bio: 'Gamer and <b>esports</b> fan.' },
  { id: 10, name: 'Julia', bio: 'Writer and <i>storyteller</i> with a passion for literature.' }
];


const SocialFeed = () => {
  const [users, setUsers] = useState(usersData);
  const [bio, setBio] = useState(users[0].bio);

  const ourUser = usersData.find(user => user.id === 1);
  const textAreaRef = useRef(null);

  const updateBio = () => {
    // Update the bio for the currently selected user in the users array
    const updatedUsers = users.map(user => {
      if (user.id === ourUser.id) {
        return { ...user, bio: bio };
      }
      return user;
    });
    setUsers(updatedUsers); // Update the users state with the new data
  };

  const applyStyle = (command, value = null) => {
    document.execCommand(command, false, value);
    textAreaRef.current.focus();
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h3>Edit your Bio</h3>
        <div className="editor-buttons">
          <button onClick={() => applyStyle('bold')}>Bold</button>
          <button onClick={() => applyStyle('italic')}>Italic</button>
          <button onClick={() => applyStyle('underline')}>Underline</button>
          <button onClick={() => applyStyle('insertImage', prompt('Enter image URL', 'http://'))}>Add Image</button>
        </div>
        <div
          contentEditable
          ref={textAreaRef}
          className="text-area"
          onInput={(e) => setBio(e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: Dompurify.sanitize(bio) }}
        ></div>
        <button onClick={updateBio} style={{ marginTop: '10px' }}>Update Bio</button>
      </div>


      <div className="main-content">
        <h2>List of User Profiles</h2>
        {users.map(user => (
          <div key={user.id} className="user-profile">
            <h3>{user.name}</h3>
            <p dangerouslySetInnerHTML={{ __html: Dompurify.sanitize(user.bio) }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialFeed;
