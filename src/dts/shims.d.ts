declare namespace NodeJS {
	interface Process {
		emit(event: 'schema-types-done'): boolean
	}
}
