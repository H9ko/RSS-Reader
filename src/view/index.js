import { watch } from 'melanke-watchjs';
import processState from '../namedConstants';
import i18next from '../i18next';

const renderFeedback = (text, colorText) => {
  const feedbackElement = document.createElement('div');
  feedbackElement.classList.add('feedback');
  feedbackElement.classList.add(colorText);
  feedbackElement.innerHTML = text;
  return feedbackElement;
};

const renderRSS = (element, rss) => {
  const existingRow = element.nextElementSibling;
  if (existingRow) {
    existingRow.remove();
  }
  const row = document.createElement('div');
  row.classList.add('row');

  const rssItems = document.createElement('div');
  rssItems.classList.add('col-6');
  rssItems.classList.add('rss-items');
  rss.feeds.forEach((feed) => {
    const div = document.createElement('div');
    const text = document.createElement('p');
    text.innerHTML = `${feed.title} : ${feed.description}`;
    div.appendChild(text);
    rssItems.appendChild(div);
  });
  row.appendChild(rssItems);

  const rssLinks = document.createElement('div');
  rssLinks.classList.add('col-6');
  rssLinks.classList.add('rss-links');

  rss.posts.forEach((topic) => {
    const div = document.createElement('div');
    const link = document.createElement('a');
    link.href = topic.link;
    link.innerHTML = topic.title;
    div.appendChild(link);
    rssLinks.appendChild(div);
  });
  row.appendChild(rssLinks);
  element.after(row);
};

const view = (state, jumbotron) => {
  const form = jumbotron.querySelector('form');

  watch(state, 'form', (prop) => {
    form[prop].value = state.form.url;
  });

  watch(state, 'rss', () => {
    renderRSS(jumbotron, state.rss);
  });

  watch(state, 'processState', () => {
    const feedbackElement = form.nextElementSibling;
    if (feedbackElement) {
      feedbackElement.remove();
    }

    switch (state.processState) {
      case processState.valid: {
        form.elements.add.disabled = false;
        form.elements.url.classList.remove('is-invalid');
        form.after(renderFeedback(i18next.t('app.URL correct'), 'text-success'));
        break;
      }
      case processState.invalid: {
        form.elements.add.disabled = true;
        form.elements.url.classList.add('is-invalid');

        form.after(renderFeedback(state.reason, 'text-danger'));
        break;
      }
      case processState.failed: {
        form.elements.add.disabled = false;

        form.after(renderFeedback(state.reason, 'text-danger'));
        break;
      }
      case processState.sending: {
        form.elements.add.disabled = true;
        form.after(renderFeedback(i18next.t('app.request sending'), 'text-info'));
        break;
      }
      case processState.completed: {
        form.elements.add.disabled = true;
        form.after(renderFeedback(i18next.t('app.Rss has been loaded'), 'text-success'));
        break;
      }
      default: {
        throw new Error(`Unknown processState: '${state.processState}'!`);
      }
    }
  });
};

export default view;
