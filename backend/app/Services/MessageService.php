<?php

namespace App\Services;

use Aws\DynamoDb\DynamoDbClient;
use Aws\DynamoDb\Marshaler;

class MessageService
{
    protected $dynamoDb;
    protected $marshaler;
    protected $tableName = 'messages';

    public function __construct()
    {
        $this->dynamoDb = new DynamoDbClient([
            'region'  => env('AWS_DEFAULT_REGION', 'us-east-1'),
            'version' => 'latest',
            'credentials' => [
                'key'    => env('AWS_ACCESS_KEY_ID'),
                'secret' => env('AWS_SECRET_ACCESS_KEY'),
            ],
            // Use DynamoDB local or prod depending on env
            'endpoint' => env('DYNAMODB_ENDPOINT') 
        ]);
        $this->marshaler = new Marshaler();
    }

    public function sendMessage(string $conversationId, int $userId, string $content, string $type = 'text')
    {
        $messageId = uniqid('msg_');
        $timestamp = (string) microtime(true);

        $item = $this->marshaler->marshalItem([
            'conversation_id' => $conversationId,
            'timestamp'       => $timestamp,
            'message_id'      => $messageId,
            'user_id'         => $userId,
            'content'         => $content,
            'type'            => $type,
            'created_at'      => date('c')
        ]);

        $this->dynamoDb->putItem([
            'TableName' => $this->tableName,
            'Item' => $item
        ]);

        return ['message_id' => $messageId, 'conversation_id' => $conversationId, 'timestamp' => $timestamp];
    }

    public function getMessages(string $conversationId, int $limit = 50)
    {
        $keyConditionExpression = 'conversation_id = :cid';
        $expressionAttributeValues = $this->marshaler->marshalItem([
            ':cid' => $conversationId
        ]);

        $result = $this->dynamoDb->query([
            'TableName' => $this->tableName,
            'KeyConditionExpression' => $keyConditionExpression,
            'ExpressionAttributeValues' => $expressionAttributeValues,
            'ScanIndexForward' => false,
            'Limit' => $limit
        ]);

        $messages = [];
        foreach ($result['Items'] as $item) {
            $messages[] = $this->marshaler->unmarshalItem($item);
        }

        return $messages;
    }
}
