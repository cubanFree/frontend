import { useEffect, useState, useRef } from 'react';
import InfoVar from './components/InfoVar';
import ContactVar from './components/ContactVar';
import MessageVar from './components/MessageVar';
import { useNavigate } from 'react-router-dom';
import {toast, Toaster} from 'react-hot-toast';
import FriendRequest from './components/FriendRequest';
import LoadingVar from './LoadingVar';

const URL_TARGET = 'http://localhost:5000'

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

      const response = await fetch(`${URL_TARGET}/open-chat/${id}`, {
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
    containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
  }
}

function ChatScreen() {

  const [userData, setUserData] = useState( null );
  const [stateChange, setStateChange] = useState( 'contacts' );
  const [isRefresh, setIsRefresh] = useState( false );
  const [chat, setChat] = useState({ username: '', chats: [] }); // guarda todo el content (body, date, _id), elfrom y username
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
      toast.error('You must be logged in to continue!');
      return;
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
