import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Clean Architecture First',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Ramsha is designed around <strong>Clean Architecture principles</strong>.
        It enforces clear separation between Domain, Application, Infrastructure,
        and API layers, helping you build scalable and maintainable systems.
      </>
    ),
  },
  {
    title: 'Explicit & Predictable',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        No magic, no hidden proxies. Ramsha favors <strong>explicit APIs</strong>
        for Unit of Work, Authorization, Settings, and Messaging, making behavior
        predictable, debuggable, and easy to reason about.
      </>
    ),
  },
  {
    title: 'Modular & Extensible',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Built around a powerful <strong>module system</strong>, Ramsha allows you
        to extend or replace features like EF Core, Authorization, Local Messaging,
        and Settings without touching your core business logic.
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
