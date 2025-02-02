import { useContext, useEffect, useRef } from 'react'
import { useState } from 'react'
import { SettingsContext } from '../../contexts/Settings'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import Icon from '../../chatGPT/Icon'
import createCompletionChatGPT from '../../chatGPT/createCompletion'
import classes from './AIcompletion.module.css'

function getAiConfigMessage(language) {
  let config = {
    role: 'system', 
    content: 'You are ChatGPT, a large language model trained by OpenAI. \nKnowledge cutoff: 2021-09'
  }

  // specify current date and time
  config.content += ' \nCurrent date and time: ' + new Date().toLocaleString() + '.'

  // specify language
  if (language)
    config.content += ' \nAnswer in ' + language + ' language.'
 
  return config
}


function GPTAIcompletion({ query, className }) {
  // settings
  const settings = useContext(SettingsContext)
  const enabled = settings.query.AI.ChatGPT.enabled
  const apiKey = settings.query.AI.ChatGPT.apiKey
  const temperature = settings.query.AI.ChatGPT.temperature
  const language = settings.query.AI.ChatGPT.language
  
  const [completion, setCompletion] = useState('')
  const chatLogRef = useRef([])
  
  useEffect(() => {
    if (!enabled) 
      return
    
    let controller = null

    if (query) {
      const currentQuery = { content: query, role: 'user' }
      const messages = [getAiConfigMessage(language), ...chatLogRef.current, currentQuery ]
      
      const completionRequest = createCompletionChatGPT(
        setCompletion,
        messages,
        temperature,
        apiKey
      )
      completionRequest.promise
      .then(result => chatLogRef.current.push(currentQuery, result))
      .catch(error => setCompletion(`## ⚠️  ${error.code || 'error'} \n \`\`\`${error.message || 'No description available ☹️'}\`\`\``))

      controller = completionRequest.controller
    }
    else
      setCompletion('')

    return () => controller && controller.abort()
  }, [query, temperature, apiKey, enabled, language])

  if (!completion || !enabled) 
    return null

  return <>
    <Icon className={classes['gemini-icon']} onClick={e => e.stopPropagation()}/>
    <div className={className} onClick={e => e.stopPropagation()}>
      <div className={classes['md-container']}>
        <ReactMarkdown children={completion}/> 
      </div>
    </div>
  </>
}

export default GPTAIcompletion