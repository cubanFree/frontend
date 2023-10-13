import React, { useEffect } from 'react';
import { User, ScrollShadow, Input, Button, Image } from '@nextui-org/react';
import { AiOutlineSend } from 'react-icons/ai';
import { BsArrowLeftShort, BsArrowDownShort } from 'react-icons/bs';
import bg_chat from '../../assets/bgChat.jpeg';
import toast from 'react-hot-toast';
import LoopMessage from './LoopMessage';
import { OpenChat, ScrollDown } from '../ChatScreen';
import LoadingVar from '../LoadingVar';

const URL_TARGET = 'http://localhost:5000'

function MessageVar(
        {
            id, 
            username, 
            chats, 
            isRefresh, 
            isOpenChat,
            isLoadingMessages,
            containerRef, 
            onRefresh = f => f, 
            onChat = f => f,
            onOpenChat = f => f,
            onLoadingMessages = f => f
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
            OpenChat({id, containerRef, onChat, onRefresh});
            toast.success(data.message);
          } else {
            toast.error(data.message);
          }
        } catch (error) {
          console.error('Error en el fetch :(', error);
          toast.error('Error during message sending.');
        }
      };      

    // event listener on enter
    const capEvent = (event, funct) => {
        if(event.key === 'Enter') {
            funct();
        }
    }

    // detectar cuando no estas en el final de los mensajes
    useEffect(() => {
        const container = containerRef.current;

        if (container) {
            const handleScroll = () => {
          
                const isNotAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight;

          
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

    useEffect(() => {
        {onLoadingMessages(false)}
    }, [chats.length > 0])

  return (
    <div className={'text-gray-300 md:col-12 md:block h-screen ' + (isOpenChat ? 'block' : 'hidden')}>

        {/* Header */}
        <div 
            className={'bg-gray-800 h-[7%] md:h-[7.5%] p-1 border-b-1 border-gray-600 sticky top-0 z-20 flex justify-center items-center gap-4' + (username === '' ? ' hidden' : '')}>
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
                        src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
                        size: "md",
                    }}
                    className='w-full flex justify-start font-semibold hover:bg-gray-800 cursor-pointer p-2'
                    isFocusable={false}
                />
        </div>

        {/* Body */}
        <div className='w-full relative'>
            <Image 
                src={bg_chat} 
                alt="bg_chat" 
                className='z-0 object-cover min-h-[100vh] w-full blur-sm' 
            />
            <div className='2xl:px-[10rem] mt-[1%] md:mb-0 px-[1.5rem] overflow-y-auto snap-y absolute top-0 w-full h-[85%]'>
                {chats.length > 0 
                    &&  ( 
                        <>
                            <ScrollShadow 
                                isEnabled={false}
                                ref={containerRef}
                                hideScrollBar 
                                className="md:h-[80vh] w-full z-10">
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
                        </>
                    )
                }
                {!chats.length > 0 && (
                    isLoadingMessages ? (
                        <LoadingVar />
                    ) : (
                        <div className="flex justify-center items-center h-[80vh] z-10">
                            <span className="text-gray-400 text-lg">No messages yet</span>
                        </div>
                    )
                )
                }
                {
                    isScrolledToBottom && (
                        <div 
                            className='absolute bottom-[1.5rem] right-[1.5rem] bg-gray-700 p-1 rounded-full'
                            onClick={() => ScrollDown({containerRef})}>
                            <BsArrowDownShort 
                                size={30} 
                                className="text-gray-400"
                            />
                        </div>
                    )
                }
            </div>
        </div>

        {/* Footer */}
        <div className='bg-gray-800 p-3 h-[8.5%] md:h-[7.5%] pe-0 border-t-1 border-gray-600 sticky bottom-0 flex z-20'>
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