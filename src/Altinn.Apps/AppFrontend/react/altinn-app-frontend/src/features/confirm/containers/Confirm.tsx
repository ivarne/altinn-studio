import * as React from 'react';
import { RouteChildrenProps, withRouter } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { createTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import {
  AltinnReceipt,
  AltinnContentLoader,
  AltinnContentIconReceipt,
  AltinnButton,
  AltinnLoader,
} from 'altinn-shared/components';
import { IAttachment, IInstance, IParty } from 'altinn-shared/types';
import { getLanguageFromKey } from 'altinn-shared/utils/language';
import {
  mapInstanceAttachments,
  getTextResourceByKey,
} from 'altinn-shared/utils';
import { AltinnAppTheme } from 'altinn-shared/theme';
import { IValidations } from 'src/types';
import { getAttachmentGroupings } from 'altinn-shared/utils/attachmentsUtils';
import ProcessDispatcher from '../../../shared/resources/process/processDispatcher';
import { IAltinnWindow, IRuntimeState } from '../../../types';
import { get } from '../../../utils/networking';
import { getValidationUrl } from '../../../utils/urlHelper';
import { updateValidations } from '../../form/validation/validationSlice';
import { mapDataElementValidationToRedux } from '../../../utils/validation';
import InstanceDataActions from '../../../shared/resources/instanceData/instanceDataActions';
import OrgsActions from '../../../shared/resources/orgs/orgsActions';
import { IApplicationMetadata } from '../../../shared/resources/applicationMetadata';
import { getTextFromAppOrDefault } from '../../../utils/textResource';
import moment from 'moment';

export type IConfirmProps = RouteChildrenProps;

const theme = createTheme(AltinnAppTheme);

const useStyles = makeStyles({
  button: {
    color: theme.altinnPalette.primary.black,
    background: theme.altinnPalette.primary.blue,
    textTransform: 'none' as const,
    fontWeight: 400,
    height: 36,
    borderRadius: '0',
    '&:hover': {
      background: theme.altinnPalette.primary.blueDarker,
      color: theme.altinnPalette.primary.white,
    },
    '&:focus': {
      background: theme.altinnPalette.primary.blueDarker,
      color: theme.altinnPalette.primary.white,
      outline: 'none',
    },
    marginTop: 28,
  },
});

export interface ISummaryData {
  languageData?: any;
  instanceOwnerParty?: any;
}

const loaderStyles = {
  paddingTop: '30px',
  marginLeft: '40px',
  height: '64px',
};

export const returnConfirmSummaryObject = (data: ISummaryData) => {
  const obj: any = {};
  const { languageData, instanceOwnerParty } = data;

  let sender = '';
  if (instanceOwnerParty?.ssn) {
    sender = `${instanceOwnerParty.ssn}-${instanceOwnerParty.name}`;
  } else if (instanceOwnerParty?.orgNumber) {
    sender = `${instanceOwnerParty.orgNumber}-${instanceOwnerParty.name}`;
  }
  obj[getLanguageFromKey('confirm.sender', languageData)] = sender;

  return obj;
};

const Confirm = (props: IConfirmProps) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [attachments, setAttachments] = React.useState<IAttachment[]>([]);
  const [lastChangedDateTime, setLastChangedDateTime] = React.useState('');
  const [instanceMetaObject, setInstanceMetaObject] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const applicationMetadata: IApplicationMetadata = useSelector(
    (state: IRuntimeState) => state.applicationMetadata.applicationMetadata,
  );
  const instance: IInstance = useSelector(
    (state: IRuntimeState) => state.instanceData.instance,
  );
  const language: any = useSelector(
    (state: IRuntimeState) => state.language.language,
  );
  const parties: IParty[] = useSelector(
    (state: IRuntimeState) => state.party.parties,
  );
  const validations: IValidations = useSelector(
    (state: IRuntimeState) => state.formValidations.validations,
  );

  const routeParams: any = props.match.params;

  const { instanceId } = window as Window as IAltinnWindow;
  const textResources = useSelector(
    (state: IRuntimeState) => state.textResources.resources,
  );

  const isLoading = (): boolean =>
    !attachments ||
    !instanceMetaObject ||
    !lastChangedDateTime ||
    !instance ||
    !lastChangedDateTime ||
    !parties;

  React.useEffect(() => {
    OrgsActions.fetchOrgs();
    InstanceDataActions.getInstanceData(
      routeParams.partyId,
      routeParams.instanceGuid,
    );
  }, []);

  React.useEffect(() => {
    if (instance && instance.org && parties && applicationMetadata) {
      const instanceOwnerParty = parties.find((party: IParty) => {
        return party.partyId.toString() === instance.instanceOwner.partyId;
      });

      const obj = returnConfirmSummaryObject({
        languageData: language,
        instanceOwnerParty,
      });
      setInstanceMetaObject(obj);
    }
  }, [parties, instance, lastChangedDateTime, applicationMetadata]);

  React.useEffect(() => {
    if (instance && instance.data && applicationMetadata) {
      const appLogicDataTypes = applicationMetadata.dataTypes.filter(
        (dataType) => !!dataType.appLogic,
      );
      const attachmentsResult = mapInstanceAttachments(
        instance.data,
        appLogicDataTypes.map((type) => type.id),
      );
      setAttachments(attachmentsResult);
      setLastChangedDateTime(
        moment(instance.lastChanged).format('DD.MM.YYYY / HH:mm'),
      );
    }
  }, [instance, applicationMetadata]);

  React.useEffect(() => {
    setIsSubmitting(false);
  }, [validations]);

  const onClickConfirm = () => {
    setIsSubmitting(true);
    get(getValidationUrl(instanceId))
      .then((data: any) => {
        const mappedValidations = mapDataElementValidationToRedux(
          data,
          {},
          textResources,
        );
        dispatch(updateValidations({ validations: mappedValidations }));
        if (data.length === 0) {
          ProcessDispatcher.completeProcess();
        }
      })
      .catch(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <>
      {isLoading() && (
        <AltinnContentLoader width={705} height={561}>
          <AltinnContentIconReceipt />
        </AltinnContentLoader>
      )}
      {!isLoading() && (
        <>
          <AltinnReceipt
            attachmentGroupings={getAttachmentGroupings(
              attachments,
              applicationMetadata,
              textResources,
            )}
            body={getTextFromAppOrDefault(
              'confirm.body',
              textResources,
              language,
              [getTextResourceByKey('ServiceName', textResources)],
            )}
            collapsibleTitle={getTextFromAppOrDefault(
              'confirm.attachments',
              textResources,
              language,
              null,
              true,
            )}
            hideCollapsibleCount={true}
            instanceMetaDataObject={instanceMetaObject}
            title={getTextFromAppOrDefault(
              'confirm.title',
              textResources,
              language,
              null,
              true,
            )}
            titleSubmitted={getTextFromAppOrDefault(
              'confirm.answers',
              textResources,
              language,
              null,
              true,
            )}
          />
          {isSubmitting ? (
            <AltinnLoader
              style={loaderStyles}
              srContent={getLanguageFromKey('general.loading', language)}
            />
          ) : (
            <AltinnButton
              btnText={getTextFromAppOrDefault(
                'confirm.button_text',
                textResources,
                language,
              )}
              onClickFunction={onClickConfirm}
              className={classes.button}
              id='confirm-button'
            />
          )}
        </>
      )}
    </>
  );
};

export default withRouter(Confirm);
