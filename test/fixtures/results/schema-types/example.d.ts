 
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface Example {
	ip: string;
	port: number;
	password: string;
	status: 'connected' | 'connecting' | 'disconnected' | 'error';
}
