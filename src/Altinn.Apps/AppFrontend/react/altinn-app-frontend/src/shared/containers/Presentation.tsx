import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AltinnAppHeader,
  AltinnSubstatusPaper,
} from 'altinn-shared/components';
import { AltinnAppTheme } from 'altinn-shared/theme';
import { IParty, IInstance } from 'altinn-shared/types';
import {
  returnUrlToMessagebox,
  getTextResourceByKey,
  getLanguageFromKey,
  returnUrlFromQueryParameter
} from 'altinn-shared/utils';
import {
  IRuntimeState,
  ProcessTaskType,
  ITextResource,
  PresentationType,
} from 'src/types';
import { getNextView } from 'src/utils/formLayout';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { get } from 'src/utils/networking';
import { getRedirectUrl } from 'src/utils/urlHelper';
import ErrorReport from '../../components/message/ErrorReport';
import Header from '../../components/presentation/Header';
import NavBar from '../../components/presentation/NavBar';

export interface IPresentationProvidedProps {
  header: string;
  type: ProcessTaskType | PresentationType;
  children?: JSX.Element;
}

const style = {
  marginBottom: '1rem',
};

const PresentationComponent = (props: IPresentationProvidedProps) => {
  const dispatch = useDispatch();
  const party: IParty = useSelector((state: IRuntimeState) =>
    state.party ? state.party.selectedParty : ({} as IParty),
  );
  const language: any = useSelector((state: IRuntimeState) =>
    state.language ? state.language.language : {},
  );
  const hideCloseButton: boolean = useSelector(
    (state: IRuntimeState) => state.formLayout.uiConfig.hideCloseButton,
  );
  const instance: IInstance = useSelector(
    (state: IRuntimeState) => state.instanceData.instance,
  );
  const userParty: IParty = useSelector((state: IRuntimeState) =>
    state.profile.profile ? state.profile.profile.party : ({} as IParty),
  );
  const textResources: ITextResource[] = useSelector(
    (state: IRuntimeState) => state.textResources.resources,
  );
  const previousFormPage: string = useSelector((state: IRuntimeState) =>
    getNextView(
      state.formLayout.uiConfig.navigationConfig[
        state.formLayout.uiConfig.currentView
      ],
      state.formLayout.uiConfig.layoutOrder,
      state.formLayout.uiConfig.currentView,
      true,
    ),
  );
  const returnToView = useSelector(
    (state: IRuntimeState) => state.formLayout.uiConfig.returnToView,
  );

  const handleBackArrowButton = () => {
    if (returnToView) {
      dispatch(
        FormLayoutActions.updateCurrentView({
          newView: returnToView,
          runValidations: 'allPages',
        }),
      );
    } else if (
      props.type === ProcessTaskType.Data ||
      props.type === PresentationType.Stateless
    ) {
      dispatch(
        FormLayoutActions.updateCurrentView({ newView: previousFormPage }),
      );
    }
  };

  const handleModalCloseButton = () => {
    const queryParameterReturnUrl = returnUrlFromQueryParameter();
    const messageBoxUrl = returnUrlToMessagebox(window.location.origin, party.partyId);
    if (!queryParameterReturnUrl) {
      window.location.href = messageBoxUrl;
      return;
    }

    get(getRedirectUrl(queryParameterReturnUrl))
      .then((response) => response)
      .catch(() => messageBoxUrl)
      .then((returnUrl) => {
        window.location.href = returnUrl;
      });
  };

  const isProcessStepsArchived = Boolean(
    props.type === ProcessTaskType.Archived,
  );
  const backgroundColor = isProcessStepsArchived
    ? AltinnAppTheme.altinnPalette.primary.greenLight
    : AltinnAppTheme.altinnPalette.primary.blue;
  document.body.style.background = backgroundColor;

  return (
    <div id='processContainer' style={style}>
      <AltinnAppHeader
        party={party}
        userParty={userParty}
        logoColor={AltinnAppTheme.altinnPalette.primary.blueDarker}
        headerBackgroundColor={backgroundColor}
        logoutText={getLanguageFromKey('general.log_out', language)}
        ariaLabelIcon={getLanguageFromKey(
          'general.header_profile_icon_label',
          language,
        )}
      />
      <div className='container'>
        <div className='row'>
          <div className='col-xl-10 offset-xl-1 a-p-static'>
            <ErrorReport language={language} />
            {isProcessStepsArchived && instance?.status?.substatus && (
              <AltinnSubstatusPaper
                label={getTextResourceByKey(
                  instance.status.substatus.label,
                  textResources,
                )}
                description={getTextResourceByKey(
                  instance.status.substatus.description,
                  textResources,
                )}
              />
            )}
            <NavBar
              handleClose={handleModalCloseButton}
              handleBack={handleBackArrowButton}
              language={language}
              showBackArrow={
                !!previousFormPage &&
                (props.type === ProcessTaskType.Data ||
                  props.type === PresentationType.Stateless)
              }
              hideCloseButton={hideCloseButton}
            />
            <div className='a-modal-content-target'>
              <div className='a-page a-current-page'>
                <div className='modalPage'>
                  <div className='modal-content'>
                    <Header {...props} language={language} />
                    <div className='modal-body a-modal-body'>
                      {props.children}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentationComponent;
