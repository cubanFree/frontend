import { useEffect, useState, useRef } from 'react';
import InfoVar from './components/InfoVar';
import ContactVar from './components/ContactVar';
import MessageVar from './components/MessageVar';
import { useNavigate } from 'react-router-dom';
import {toast, Toaster} from 'react-hot-toast';
import FriendRequest from './components/FriendRequest';
import LoadingVar from './LoadingVar';

const URL_TARGET = 'https://chats-backend-api.vercel.app'

// open chat function
export async function OpenChat(
  { 
    id, 
    containerRef, 
    onChat = f => f
  }) {
    
    const idContact = localStorage.getItem('idContact');
    if (!idContact) {
      toast.error('Missing idContact in localStorage.');
      return;
    }

    try {
      const response = await fetch(`${URL_TARGET}/open-chat/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            idContact: idContact,
        })
      });

      const data = await response.json();

      if (data) {
          onChat( data );
          setTimeout(() => {
            ScrollDown({containerRef});
          }, 0)
      } else {
          toast.error( 'Error to get chat' );
      }
        
    } catch (error) {
        console.error('Error en el fetch OpenChat :(', error);
    }

    return null;
}

// scroll down function
export function ScrollDown ({containerRef}) {
  if (containerRef.current) {
    containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
  }
  return;
}

function ChatScreen() {

  const [userData, setUserData] = useState( null );
  const [stateChange, setStateChange] = useState( 'contacts' );
  const [isRefresh, setIsRefresh] = useState( false );
  const [chat, setChat] = useState({ username: '', chats: [] });
  const [isOpenChat, setIsOpenChat] = useState(false);
  const [isLogout, setIsLogout] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const navigate = useNavigate();
  const userId = localStorage.getItem( 'userId' );
  const containerRef = useRef( null );

  // Obtener los datos del Host
  useEffect(() => {
    if (!userId) {
      localStorage.removeItem('idContact');
      navigate('/');
      setTimeout(() => {
        toast.error('You must be logged in to continue!');
      }, 0)
    }

    // Realiza la solicitud HTTP para obtener los datos del usuario
    fetch(`${URL_TARGET}/chat/${userId}`, { method: 'GET' })
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

  // refresh Chat
  useEffect(() => {
    setIsRefresh(!isRefresh);
  }, [chat])

  return (
    <div className='bg-gray-800 text-gray-300 w-full md:h-[100vh] overflow-hidden h-screen p-0 m-0'>
      {userData || isLogout
        ? ( // if userData exists
          <div className='md:flex block bg-gray-900'>

            {/* Screen InfoVar */}
            <InfoVar 
              isRefresh={isRefresh} 
              username={userData.username} 
              isOpenChat={isOpenChat}
              id={userId} 
              onState={(flag) => setStateChange(flag)}
              onLogout={() => setIsLogout}
            />

            {/* Screen ContactVar */}
            {
              // State Contacts
              stateChange === 'contacts' && <ContactVar 
                                              onRefresh={() => setIsRefresh(!isRefresh)} 
                                              isRefresh={isRefresh} 
                                              isOpenChat={isOpenChat}
                                              id={userId} 
                                              usernameHost={userData.username}
                                              containerRef={containerRef} 
                                              onChat={setChat}
                                              onOpenChat={setIsOpenChat}
                                              onLoadingMessages={setIsLoadingMessages}
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
              isOpenChat={isOpenChat}
              isLoadingMessages={isLoadingMessages}
              id={userId} 
              onChat={setChat} 
              onOpenChat={setIsOpenChat}
              onLoadingMessages={() => setIsLoadingMessages}
              containerRef={containerRef} 
              {...chat}
            />

          </div>
        ) : (
          // Loading
          <LoadingVar />
      )}
      <Toaster position='top-center'/>
    </div>
  );
}

export default ChatScreen;
