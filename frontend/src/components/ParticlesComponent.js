import React from 'react';
import Particles from '@tsparticles/react';
import particlesConfig from '../components/particlesConfig';

const ParticlesComponent = () => {
  console.log('ParticlesComponent rendered');
  console.log('particlesConfig:', particlesConfig);

  return (
    <Particles
      id="tsparticles"
      options={particlesConfig}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default ParticlesComponent;
