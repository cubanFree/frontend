import { useEffect, useState, useRef } from 'react';
import { Spinner } from '@nextui-org/react';
import InfoVar from './components/InfoVar';
import ContactVar from './components/ContactVar';
import MessageVar from './components/MessageVar';
import { useNavigate } from 'react-router-dom';
import {toast, Toaster} from 'react-hot-toast';
import FriendRequest from './components/FriendRequest';

// open chat function
export async function OpenChat(
    { 
      id, 
      containerRef, 
      onChat = f => f, 
      onRefresh = f => f
    }
  ) {

  try {
      const idContact = localStorage.getItem('idContact');

      if (!idContact) {
        toast.error('Missing idContact in localStorage.');
        return;
      }

      const response = await fetch(`https://db-alva-chats.us-east-2.elasticbeanstalk.com/open-chat/${id}`, {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              idContact: idContact,
          }),
      });

      const data = await response.json();

      if (data) {
          onChat( data );

          // update state
          onRefresh(); 

          // wait for update state and Scroll down
          setTimeout(() => {
            ScrollDown({ containerRef });
          }, 0)
      } else {
          toast.error( 'Unexpected response from the server.' );
      }
      
  } catch (error) {
      console.error('Error opening chat :(', error);
      toast.error('Error opening chat. Please try again.');
  }
}

// scroll down function
export function ScrollDown ({containerRef}) {
  if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }
}

function ChatScreen() {

  const [userData, setUserData] = useState( null );
  const [stateChange, setStateChange] = useState( 'contacts' );
  const [isRefresh, setIsRefresh] = useState( false );
  const [chat, setChat] = useState({ username: '', chats: [] }); // guarda todo el content (body, date, _id), elfrom y username
  
  const navigate = useNavigate();
  const userId = localStorage.getItem( 'userId' );
  const containerRef = useRef( null );

  // Obtener los datos del Host
  useEffect(() => {
    if (!userId) {
      localStorage.removeItem('idContact');
      navigate('/');
      toast.error('You must be logged in to continue!');
      return;
    }

    // Realiza la solicitud HTTP para obtener los datos del usuario
    fetch(`https://db-alva-chats.us-east-2.elasticbeanstalk.com/chat/${userId}`, { method: 'GET' })
      .then(response => response.json())
      .then(data => {
        setUserData({id: data._id, username: data.username});
      })
      .catch(() => {
        localStorage.removeItem('userId');
        localStorage.removeItem('idContact');
        navigate('/');
      });
  }, [userId]);

  return (
    <div className='bg-gray-800 text-gray-300 w-full h-[100vh] p-0 m-0'>
      {userData ? ( // if userData exists
        <div className='flex bg-gray-900'>

          {/* Screen InfoVar */}
          <InfoVar 
            isRefresh={isRefresh} 
            username={userData.username} 
            id={userId} 
            onState={(flag) => setStateChange(flag)}
          />

          {/* Screen ContactVar */}
          {
            // State Contacts
            stateChange === 'contacts' && <ContactVar 
                                            onRefresh={() => setIsRefresh(!isRefresh)} 
                                            isRefresh={isRefresh} 
                                            id={userId} 
                                            usernameHost={userData.username}
                                            containerRef={containerRef} 
                                            onChat={setChat}
                                          />
          }
          {
            // State Friends Requests
            stateChange === 'friends-requests' && <FriendRequest 
                                                    onRefresh={() => setIsRefresh(!isRefresh)} 
                                                    isRefresh={isRefresh} 
                                                    id={userId}
                                                  />
          }

          {/* Screen MessagesVar */}
          <MessageVar 
            onRefresh={() => setIsRefresh(!isRefresh)} 
            isRefresh={isRefresh} 
            id={userId} 
            onChat={setChat} 
            containerRef={containerRef} 
            {...chat}
          />

        </div>
      ) : (
        // Loading
        <div className='flex flex-col justify-center items-center w-full h-full'>
          <Spinner 
            color="warning" 
            size='lg'
          />
          <span className='text-lg md:text-xl text-white flex justify-center items-center'>
              Loading...
          </span>
        </div>
      )}
      <Toaster position='top-center'/>
    </div>
  );
}

export default ChatScreen;
