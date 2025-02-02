import { useContext, useEffect, useRef, useState } from 'react';
import { SettingsContext } from '../../contexts/Settings';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import GeminiIcon from '../../Gemini/Icon';
import createCompletionGemeni from '../../Gemini/createCompletion';
import classes from './AIcompletion.module.css';

function GeminiAIcompletion({ query, className }) {
  // settings
  const settings = useContext(SettingsContext);
  const enabled = settings.query.AI.GoogleGemeni.enabled;
  const apiKey = settings.query.AI.GoogleGemeni.apiKey;
  
  const [completion, setCompletion] = useState('');
  const chatLogRef = useRef([]);
  
  useEffect(() => {
    if (!enabled) return;
    
    let controller = null;

    if (query) {
      const currentQuery = { content: query, role: 'user' };
      const messages = [...chatLogRef.current, currentQuery];
      
      const completionRequest = createCompletionGemeni(setCompletion, messages, apiKey);
      
      completionRequest.promise
        .then(result => chatLogRef.current.push(currentQuery, result))
        .catch(error => setCompletion(`## ⚠️  ${error.code || 'error'} \n \`\`\`${error.message || 'No description available ☹️'}\`\`\``));

      controller = completionRequest.controller;
    } else {
      setCompletion('');
    }

    return () => controller && controller.abort();
  }, [query, apiKey, enabled]);

  if (!completion || !enabled) return null;

  return (
    <>
      <GeminiIcon className={classes['gemini-icon']} onClick={e => e.stopPropagation()} />
      <div className={className} onClick={e => e.stopPropagation()}>
        <div className={classes['md-container']}>
          <ReactMarkdown>{completion}</ReactMarkdown>
        </div>
      </div>
    </>
  );
}

export default GeminiAIcompletion;
