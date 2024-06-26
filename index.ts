import {
    ErrorHandler,
    HandlerInput,
    RequestHandler,
    SkillBuilders,
  } from 'ask-sdk-core';
  import {
    Response,
    SessionEndedRequest,
  } from 'ask-sdk-model';
  import {
        GetObjectCommand,
        S3Client,
  } from '@aws-sdk/client-s3'

  const LaunchRequestHandler: RequestHandler = {
    canHandle(handlerInput: HandlerInput): boolean {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'LaunchRequest';        
    },
    handle(handlerInput: HandlerInput): Response {
      const speechText = 'Hello welcome to this audio news letter.';
  
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .withSimpleCard('Hello welcome to this audio news letter.', speechText)
        .getResponse();
    },
  };

  const ReadNewsLetterHandler: RequestHandler = {
    canHandle(handlerInput: HandlerInput): boolean {
      const request = handlerInput.requestEnvelope.request;  
      return request.type === 'IntentRequest'
        && request.intent.name === 'ReadNewsLetterIntent';
    },
    async handle(handlerInput: HandlerInput): Promise<Response> {
        let speechText = await getItemFromS3()
        if(speechText) {
            return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('newsLetter: ', speechText)
            .getResponse();
        }
        return handlerInput.responseBuilder
        .speak('something went wrong')
        .withSimpleCard('newsLetter: ', 'something went wrong')
        .getResponse();
    },
  };

  const PlayAudioHandler: RequestHandler = {
    canHandle(handlerInput: HandlerInput): boolean {
      const request = handlerInput.requestEnvelope.request;  
      return request.type === 'IntentRequest'
        && request.intent.name === 'PlayAudioIntent';
    },
    async handle(handlerInput: HandlerInput): Promise<Response> {
        let speechText = Audio
        if(speechText) {
            return handlerInput.responseBuilder
            .addAudioPlayerPlayDirective('REPLACE_ALL','https://soundcloud.com/owenchapman-1/3-x-2', '', 0)
            .withSimpleCard('newsLetter: ', '3 x 2')
            .getResponse();
        }
        return handlerInput.responseBuilder
        .speak('something went wrong')
        .withSimpleCard('newsLetter: ', 'something went wrong')
        .getResponse();
    },
  };

  const HelpIntentHandler: RequestHandler = {
    canHandle(handlerInput: HandlerInput): boolean {
      const request = handlerInput.requestEnvelope.request;    
      return request.type === 'IntentRequest'
        && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput: HandlerInput): Response {
      const speechText = 'You can ask me to read the news letter';
  
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .withSimpleCard('You can ask me to read the news letter', speechText)
        .getResponse();
    },
  };

  const CancelAndStopIntentHandler: RequestHandler = {
    canHandle(handlerInput : HandlerInput) : boolean {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'IntentRequest'
        && (request.intent.name === 'AMAZON.CancelIntent'
           || request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput : HandlerInput): Response {
      const speechText = 'Goodbye!';
  
      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Goodbye!', speechText)
        .withShouldEndSession(true)      
        .getResponse();
    },
  };

  const SessionEndedRequestHandler: RequestHandler = {
    canHandle(handlerInput : HandlerInput): boolean {
      const request = handlerInput.requestEnvelope.request;    
      return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput : HandlerInput): Response {
      console.log(`Session ended with reason: ${(handlerInput.requestEnvelope.request as SessionEndedRequest).reason}`);
  
      return handlerInput.responseBuilder.getResponse();
    },
  };

  const ErrorHandler: ErrorHandler = {
    canHandle(handlerInput : HandlerInput, error : Error ) : boolean {
      return true;
    },
    handle(handlerInput : HandlerInput, error : Error) : Response {
      console.log(`Error handled: ${error.message}`);
  
      return handlerInput.responseBuilder
        .speak('Sorry, I don\'t understand your command. Please say it again.')
        .reprompt('Sorry, I don\'t understand your command. Please say it again.')
        .getResponse();
    }
  };

  let skill;

exports.handler = async (event, context) => {
  console.log(`REQUEST++++${JSON.stringify(event)}`);
  if (!skill) {
    skill = SkillBuilders.custom()
      .addRequestHandlers(
        LaunchRequestHandler,
        ReadNewsLetterHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
      )
      .addErrorHandlers(ErrorHandler)
      .create();
  }

  const response = await skill.invoke(event, context);
  console.log(`RESPONSE++++${JSON.stringify(response)}`);

  return response;
};

async function getItemFromS3(): Promise<string | undefined> {

    const s3 = new S3Client({region: 'eu-west-1'});
    const params = { Bucket: process.env.AWS_S3_BUCKET_NAME ?? '', Key: 'newsletter.txt' };
    try {
      const body = (await s3.send(new GetObjectCommand(params))).Body?.transformToString();
        console.log(body)
      return body;
    } catch (err) {
        console.log(err)
        return "something went wrong"
    }
  }