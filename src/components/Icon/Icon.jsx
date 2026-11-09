import moon from '../../img/svg/moon.svg';
import skull from '../../img/svg/skull.svg';
import sun from '../../img/svg/sun.svg';
import undo from '../../img/svg/undo.svg';
import redo from '../../img/svg/redo.svg';
import share from '../../img/svg/share.svg';
import sparkles from '../../img/svg/sparkles.svg';
import styles from './Icon.module.css';

const icons = {
  moon,
  skull,
  sun,
  undo,
  redo,
  share,
  sparkles,
};

export default function Icon({ name, size = 24 }) {
  const source = icons[name];

  if (!source) return null;

  return (
    <span
      className={styles.icon}
      aria-hidden="true"
      style={{
        '--icon-url': `url("${source}")`,
        width: size,
        height: size,
      }}
    />
  );
}
