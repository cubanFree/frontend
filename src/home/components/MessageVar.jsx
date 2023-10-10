import React, { useEffect } from 'react';
import { User, ScrollShadow, Input, Button, Image, Skeleton } from '@nextui-org/react';
import { AiOutlineSend } from 'react-icons/ai';
import bg_chat from '../../assets/bgChat.jpeg';
import toast from 'react-hot-toast';
import LoopMessage from './LoopMessage';
import { OpenChat } from '../ChatScreen';

function MessageVar(
        {
            id, 
            username, 
            chats, 
            isRefresh, 
            containerRef, 
            onRefresh = f => f, 
            onChat = f => f
        }
    ) {

    const [writeMessage, setWriteMessage] = React.useState('');

    const prevDateRef = React.useRef(null);

    // Send message function
    const sendMessage = async (e, message) => {
        e.preventDefault();
      
        if (writeMessage === '') {
          toast.error('Write a message!');
          return;
        }
      
        try {
          const response = await fetch(`https://alva-chats-server.mongo.cosmos.azure.com/send-message/${id}`, {
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

    // refresh
    useEffect(() => {
        setWriteMessage('');
    }, [isRefresh]);

  return (
    <div className=' text-gray-300 w-full h-full '>

        {/* Header */}
        <div 
            className='bg-gray-800 p-4 border-b-1 border-gray-600 sticky top-0 z-20'>
                {username
                    ? 
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
                    :
                        <div className="max-w-[300px] w-full flex items-center gap-3">
                            <div>
                                <Skeleton className="flex rounded-full w-[2.5rem] h-[2.5rem] bg-gray-600"/>
                            </div>  
                            <div 
                                className="w-full flex flex-col gap-2">
                                    <Skeleton className="h-2 w-4/5 rounded-lg bg-gray-600"/>
                                    <Skeleton className="h-2 w-3/5 rounded-lg bg-gray-600"/>
                            </div>
                        </div>
                }
        </div>

        {/* Body */}
        <div className='w-full relative'>
            <Image 
                src={bg_chat} 
                alt="bg_chat" 
                className='z-0 object-cover min-h-[100vh] w-full blur-sm' 
            />
            <div className='p-[2rem] md:px-[10rem] overflow-auto snap-y absolute top-0 w-full'>
                {chats.length > 0 
                    ? (
                        <ScrollShadow 
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
                    ) : (
                        <div className='flex justify-center items-center h-[80vh] z-10'>
                            <span className='text-gray-400 text-lg'>
                                No messages yet
                            </span>
                        </div>
                    )
                }
            </div>
        </div>

        {/* Footer */}
        <div className='bg-gray-800 p-4 border-t-1 border-gray-600 sticky bottom-0 flex z-20'>
            <Input 
                isDisabled={!username} 
                value={writeMessage} 
                isClearable 
                type="text" 
                variant="underlined" 
                placeholder="Type a message" 
                onChange={(e) => setWriteMessage(e.target.value)} 
                onKeyUp={(e) => capEvent(e, () => sendMessage(e, writeMessage))}
            />
            <Button 
                isDisabled={!username} 
                className='bg-dark' 
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