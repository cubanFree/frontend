import React, { useEffect } from 'react';
import { User, ScrollShadow, Input, Button } from '@nextui-org/react';
import { AiOutlineSend } from 'react-icons/ai';
import { BsArrowLeftShort, BsArrowDownShort } from 'react-icons/bs';
import bg_chat from '../../assets/bgChat.jpeg';
import toast from 'react-hot-toast';
import LoopMessage from './LoopMessage';
import { OpenChat, ScrollDown } from '../ChatScreen';
import avatarDefault from '../../assets/avatar.jpg';

const URL_TARGET = 'http://localhost:5000'

function MessageVar(
        {
            id, 
            username, 
            chats, 
            isRefresh, 
            isOpenChat,
            containerRef,
            onChat = f => f,
            onOpenChat = f => f
        }
    ) {

    const [writeMessage, setWriteMessage] = React.useState('');
    const [isScrolledToBottom, setIsScrolledToBottom] = React.useState(false);

    const prevDateRef = React.useRef(null);

    // Send message function
    const sendMessage = async (e, message) => {
        e.preventDefault();
      
        if (writeMessage === '') {
          toast.error('Write a message!');
          return;
        }
      
        try {
          const response = await fetch(`${URL_TARGET}/send-message/${id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              usernameContact: username,
              message: message,
            }),
          });
      
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
      
          const data = await response.json();
      
          if (data) {
            OpenChat({id, containerRef, onChat});
            toast.success(data.message);
          } else {
            toast.error(data.message);
          }
        } catch (error) {
          console.error('Error en el fetch :(', error);
        }
    };      

    // event listener on enter
    const capEvent = (event, funct) => {
        if(event.key === 'Enter') {
            funct();
        }
    }

    // detectar cuando no estas en el final de los mensajes y loading
    useEffect(() => {
        const container = containerRef.current;

        if (container) {
            const handleScroll = () => {
                const isNotAtBottom = container.scrollTop + container.clientHeight + 20 >= container.scrollHeight;
                setIsScrolledToBottom(!isNotAtBottom);
              };
          
              // Agrega el event listener cuando el componente está montado
              container.addEventListener('scroll', handleScroll);
          
              // Limpia el event listener cuando el componente se desmonta
              return () => {
                container.removeEventListener('scroll', handleScroll);
              };
        }
    }, [chats]);

    // refresh
    useEffect(() => {
        setWriteMessage('');
    }, [isRefresh]);

  return (
    <div className={'text-gray-300 md:col-12 md:block h-screen ' + (isOpenChat ? 'block' : 'hidden')}>

        {/* Header */}
        <div 
            className={'bg-gray-800 min-h-[7vh] p-2 border-b-1 border-gray-600 sticky top-0 z-20 flex justify-center items-center gap-4' + (username === '' ? ' hidden' : '')}>
                <div 
                    className='bg-gray-600 p-1 rounded-full md:hidden'
                    onClick={(e) => {
                        e.preventDefault();
                        onChat({ username: '', chats: [] });
                        onOpenChat(false);
                    }}>
                        <BsArrowLeftShort size={25}/>
                </div>
                <User
                    name={username}
                    description="Product Designer"
                    avatarProps={{
                        src: avatarDefault,
                        size: "md",
                        isBordered: true
                    }}
                    className='w-full flex justify-start font-semibold hover:bg-gray-800 cursor-pointer p-2'
                    isFocusable={false}
                />
        </div>

        {/* Body */}
        <div className='w-full relative min-h-[85vh]'>
            <img 
                src={bg_chat} 
                alt="bg_chat"
                className='object-cover w-full h-screen absolute top-0 z-0'
            />
            <div className='2xl:px-[10rem] px-[1.5rem] w-full relative z-10'>
                {chats.length > 0 
                    ?  (
                        <ScrollShadow 
                            isEnabled={false}
                            ref={containerRef}
                            hideScrollBar 
                            className="h-[85vh] w-full">
                                {chats.map((message, index) => {

                                        // get Date
                                        const currentDate = new Date(message.body.date);
                                        const getDate = currentDate.toLocaleDateString()
                                        const getHour = currentDate.toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true })

                                        if(prevDateRef.current !== getDate || index === 0) {
                                            prevDateRef.current = getDate; 
                                            return (
                                                <React.Fragment key={index}>
                                                    {/* Show date */}
                                                    <div className='flex justify-center items-center'>
                                                        <div className='border-b-1 border-gray-600 w-[50%]'></div>
                                                        <div className="flex justify-center items-center">
                                                            <span className="text-[0.9rem] text-gray-400 px-2">{getDate}</span>
                                                        </div>
                                                        <div className='border-b-1 border-gray-600 w-[50%]'></div>
                                                    </div>
                                                    {/* Show date, one time */}
                                                    <div>
                                                        <LoopMessage 
                                                            key={index} 
                                                            index={index} 
                                                            getHour={getHour} 
                                                            message={message} 
                                                        />
                                                    </div>
                                                </React.Fragment>
                                            )
                                        } 

                                        return (
                                            <React.Fragment key={index}>
                                                {/* Show date, one time */}
                                                <div>
                                                    <LoopMessage 
                                                        key={index} 
                                                        index={index} 
                                                        getHour={getHour} 
                                                        message={message} 
                                                    />
                                                </div>
                                            </React.Fragment>
                                        );
                                    })
                                }
                        </ScrollShadow>
                    ) : (
                        <div className="flex justify-center items-center min-h-screen">
                            <span className="text-gray-400 text-lg">No messages yet</span>
                        </div>
                    )
                }
                {
                    isScrolledToBottom && username && (
                        <div 
                            className='absolute bottom-[1.5rem] right-[1.5rem] bg-gray-700 p-1 rounded-full cursor-pointer border-2 border-gray-500'
                            onClick={() => ScrollDown({containerRef})}>
                                <BsArrowDownShort 
                                    size={25} 
                                    className="text-gray-400"
                                />
                        </div>
                    )
                }
            </div>
        </div>

        {/* Footer */}
        <div className={'bg-gray-800 p-3 min-h-[8.5vh] pe-0 border-t-1 border-gray-600 flex z-10 relative ' + (username === '' ? ' hidden' : '')}>
            <Input 
                isDisabled={!username} 
                value={writeMessage} 
                isClearable 
                fullWidth={true}
                type="text"
                radius="sm"
                className="text-white bg-dark"
                variant="underlined" 
                placeholder="Type a message" 
                onChange={(e) => setWriteMessage(e.target.value)} 
                onKeyUp={(e) => capEvent(e, () => sendMessage(e, writeMessage))}
            />
            <Button 
                isDisabled={!username} 
                className='bg-dark p-0' 
                onClick={(e) => sendMessage(e, writeMessage)}>
                    <AiOutlineSend 
                        size={20} 
                        color='white'
                    />
            </Button>
        </div>
    </div>
  )
}

export default MessageVar;