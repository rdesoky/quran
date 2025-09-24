import { useEffect, useRef, useCallback } from 'react';

interface UseWakeLockOptions {
	enabled?: boolean;
	onAcquired?: (wakeLock: WakeLockSentinel) => void;
	onReleased?: () => void;
	onError?: (error: Error) => void;
}

export const useWakeLock = ({
	enabled = true,
	onAcquired,
	onReleased,
	onError,
}: UseWakeLockOptions = {}) => {
	const wakeLockRef = useRef<WakeLockSentinel | null>(null);
	const isAcquiringRef = useRef<boolean>(false);

	const isSupported = 'wakeLock' in navigator;

	const acquireWakeLock = useCallback(async () => {
		// Prevent multiple simultaneous acquisition attempts
		if (isAcquiringRef.current || wakeLockRef.current?.released === false) {
			return;
		}

		if (!isSupported) {
			onError?.(new Error('Wake Lock API is not supported in this browser'));
			return;
		}

		if (!enabled) {
			return;
		}

		// Only acquire wake lock if document is visible
		if (document.visibilityState !== 'visible') {
			return;
		}

		isAcquiringRef.current = true;

		try {
			const wakeLock = await navigator.wakeLock?.request('screen');
			wakeLockRef.current = wakeLock;
			isAcquiringRef.current = false;

			console.log('Screen Wake Lock acquired successfully');
			onAcquired?.(wakeLock);

			// Listen for wake lock release
			const handleRelease = () => {
				console.log('Screen Wake Lock was released');
				wakeLockRef.current = null;
				onReleased?.();

				// Try to re-acquire if still enabled and document is visible
				if (enabled && document.visibilityState === 'visible') {
					setTimeout(() => {
						acquireWakeLock();
					}, 100); // Small delay to avoid rapid re-acquisition
				}
			};

			wakeLock.addEventListener('release', handleRelease);

		} catch (error) {
			isAcquiringRef.current = false;
			const err = error as Error;
			console.error('Failed to acquire Screen Wake Lock:', err.message);
			onError?.(err);
		}
	}, [enabled, isSupported, onAcquired, onReleased, onError]);

	const releaseWakeLock = useCallback(async () => {
		if (wakeLockRef.current && !wakeLockRef.current.released) {
			try {
				await wakeLockRef.current.release();
				wakeLockRef.current = null;
				console.log('Screen Wake Lock released manually');
			} catch (error) {
				console.error('Failed to release Wake Lock:', error);
				onError?.(error as Error);
			}
		}
	}, [onError]);

	// Handle visibility changes
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				// Re-acquire wake lock when page becomes visible
				if (enabled && (!wakeLockRef.current || wakeLockRef.current.released)) {
					acquireWakeLock();
				}
			}
			// Note: We don't release on visibility hidden because the browser 
			// automatically releases wake locks when the page is not visible
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [acquireWakeLock, enabled]);

	// Initial acquisition and cleanup
	useEffect(() => {
		if (enabled) {
			acquireWakeLock();
		} else {
			releaseWakeLock();
		}

		return () => {
			releaseWakeLock();
		};
	}, [enabled, acquireWakeLock, releaseWakeLock]);

	return {
		isSupported,
		isActive: wakeLockRef.current !== null && !wakeLockRef.current?.released,
		acquire: acquireWakeLock,
		release: releaseWakeLock,
	};
};

export default useWakeLock;
