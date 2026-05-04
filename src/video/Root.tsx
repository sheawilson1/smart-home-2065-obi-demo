import { Composition } from 'remotion';
import { ObiLaunchDemo } from './launch/ObiLaunchDemo';

export const RemotionRoot = () => {
  return (
    <Composition
      id="ObiLaunchDemo"
      component={ObiLaunchDemo}
      durationInFrames={960}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
