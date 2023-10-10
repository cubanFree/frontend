import { Card, CardFooter, CardBody } from '@nextui-org/react';

function LoopMessage ({index, getHour, message}) {
    return (
      <>
        {/* Show message */}
        <div className={'flex my-3 ' + (message.from === 'guest' ? 'justify-start' : message.from === 'host' && 'justify-end')}>
          <Card 
            key={index} 
            className="max-w-[45%] bg-gray-700 p-1">

              {/* Content message */}
              <CardBody className={'p-1 rounded-md text-gray-200 ' + (message.from === 'guest' ? 'bg-gray-600' : message.from === 'host' && 'bg-green-800')}>
                <span className='text-[1rem] px-1'>
                  {message.body.content}
                </span>
              </CardBody>
              
              {/* Hour message */}
              <CardFooter className={'p-1 px-2 text-gray-300 flex items-center ' + (message.from === 'host' ? 'justify-end' : 'justify-start')}>
                <span className='text-[0.8rem] p-0'>
                  {`${getHour}`}
                </span>
              </CardFooter>

          </Card>
        </div>
      </>
    );
}

export default LoopMessage;