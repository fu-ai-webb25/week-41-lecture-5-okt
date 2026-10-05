import { useRef, useState } from 'react';
import Message from '../message/Message';
import './chat.css';
import { ChatOllama } from '@langchain/ollama';

const Chat = () => {
    const llm = new ChatOllama({
        model : 'gemma3:4b'
    });

    const [messages, setMessages] = useState([
        {
            role : 'system',
            content : 'Du är en språkmodell specialiserad på fotbollsregler. Om du får en fråga som handlar om någonting annat än just regler i sporten fotboll, så vill jag att du hänvisar till att dina inställningar inte tillåter dig att svara på den frågan.'
        },
        {
            role : 'assistant',
            content : 'Hej, hur kan jag hjälpa dig?'
        }
    ]);
    const [streamMessage, setStreamMessage] = useState(null);
    const inputRef = useRef();

    const messageComponents = messages.map((message, index) => {
        return <Message 
            key={ index }
            content={ message.content }
            role={ message.role }
        />
    });

    const getAnswer = async (event) => {
        event.preventDefault();
        const userInput = inputRef.current.value;
        inputRef.current.value = '';

        setMessages(prev => [...prev, { role : 'user', content : userInput }]);
        const updatedMessages = [...messages, { role : 'user', content : userInput }];
        
        const answer = await llm.stream(updatedMessages);
        let temp = '';
        for await(const chunk of answer) {
            temp += chunk.content;
            console.log(temp);
            setStreamMessage(temp);
        }
        setStreamMessage(null);


        setMessages(prev => [...prev, { role : 'assistant', content : temp }]);
    }

    return (
        <main className="chat">
            <section className="chat__messages">
                { messageComponents }
                { streamMessage && <Message content={ streamMessage } role="assistant" />}
            </section>
            <form className="chat__form" onSubmit={ getAnswer }>
                <input type="text" className="chat__input" ref={ inputRef } />
                <button className="chat__submit">Skicka!</button>
            </form>
        </main>
    )
}

export default Chat;