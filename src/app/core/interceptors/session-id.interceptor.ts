import { HttpInterceptorFn } from '@angular/common/http';

const SESSION_ID_KEY = 'sessionId';

function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

export const sessionIdInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionId = getOrCreateSessionId();
  const reqWithSessionId = req.clone({
    setHeaders: { 'X-Session-Id': sessionId }
  });
  return next(reqWithSessionId);
};
