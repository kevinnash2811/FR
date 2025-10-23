import leaflet from 'leaflet';

export const createButton = ({
  label,
  icon,
  onClick,
  container
}: {
  label: string;
  icon: string;
  onClick: () => void;
  container: HTMLElement;
}) => {
  const fontSize = '0.8rem';
  const button = leaflet.DomUtil.create('button', 'text-white bg-blue-10 q-btn q-btn--item no-outline q-btn--actionable q-focusable q-hoverable q-btn--no-uppercase', container);
  const showIcon = leaflet.DomUtil.create('i', 'q-icon notranslate material-icons-outlined')
  showIcon.ariaHidden = 'true';
  showIcon.role = icon;
  showIcon.style.fontSize = fontSize;

  showIcon.textContent = icon
  button.style.display = 'flex';
  button.style.gap = '5px';
  button.style.flexDirection = 'row';
  button.style.justifyContent = 'space-between';
  button.style.alignItems = 'center';
  button.style.fontSize = fontSize;

  button.addEventListener('click', onClick);

  button.append(showIcon, label)
  return button;
}